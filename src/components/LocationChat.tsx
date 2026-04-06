import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Send, MessageCircle, MapPin, Search, ClipboardList, Bell, BellOff, Loader2, User } from 'lucide-react';
import { INDIAN_STATES, getCitiesByState, SURAT_AREAS } from '@/data/locations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  area: string | null;
  city: string;
  state: string;
  created_at: string;
}

interface LocationChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationChat: React.FC<LocationChatProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [areaSearch, setAreaSearch] = useState('');
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reqForm, setReqForm] = useState({
    description: '',
    property_type: 'any',
    budget: '',
    bedrooms: '',
    phone: '',
    name: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const areaInputRef = useRef<HTMLInputElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Close area dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target as Node)) {
        setIsAreaDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch messages from DB and subscribe to realtime
  useEffect(() => {
    if (!selectedCity || !selectedState) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      let query = supabase
        .from('chat_messages' as any)
        .select('*')
        .eq('city', selectedCity)
        .eq('state', selectedState)
        .order('created_at', { ascending: true })
        .limit(100);

      if (selectedArea) {
        query = query.eq('area', selectedArea);
      }

      const { data, error } = await query;
      if (!error && data) {
        setMessages(data as any as ChatMessage[]);
      }
      setLoadingMessages(false);
    };

    fetchMessages();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel(`chat-${selectedCity}-${selectedState}-${selectedArea || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMsg = payload.new as any as ChatMessage;
          // Only add if it matches current filters
          if (
            newMsg.city === selectedCity &&
            newMsg.state === selectedState &&
            (!selectedArea || newMsg.area === selectedArea)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Browser notification for messages from others
            if (
              newMsg.user_id !== user?.id &&
              notificationsEnabled &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(`${newMsg.user_name} in ${newMsg.area || newMsg.city}`, {
                body: newMsg.content,
                icon: newMsg.user_avatar || '/placeholder.svg',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCity, selectedState, selectedArea, user?.id, notificationsEnabled]);

  // Subscribe to realtime requirement notifications for brokers
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('area-requirements-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'area_requirements' },
        (payload) => {
          const req = payload.new as any;
          if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`New Requirement in ${req.area}`, {
              body: req.description || 'New property requirement posted',
              icon: '/placeholder.svg',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    if (permission === 'granted') {
      toast.success('Notifications enabled! You will be alerted for new requirements.');
    } else if (permission === 'denied') {
      toast.error('Notification permission denied. You can enable it from browser settings.');
    }
  };

  const filteredAreas = useMemo(() => {
    const q = areaSearch.toLowerCase();
    return SURAT_AREAS.filter(a => a.toLowerCase().includes(q)).sort();
  }, [areaSearch]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user || !selectedCity || !selectedState) return;

    const { error } = await supabase.from('chat_messages' as any).insert({
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url || null,
      content: content.trim(),
      area: selectedArea || null,
      city: selectedCity,
      state: selectedState,
    } as any);

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please sign in.');
    }
    setInputValue('');
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity('');
    setSelectedArea('');
    setAreaSearch('');
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedArea('');
    setAreaSearch('');
  };

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setAreaSearch(area);
    setIsAreaDropdownOpen(false);
  };

  const clearArea = () => {
    setSelectedArea('');
    setAreaSearch('');
  };

  const getCitiesForSelectedState = () => {
    return selectedState ? getCitiesByState(selectedState) : [];
  };

  const handleSubmitRequirement = async () => {
    if (!user) {
      toast.error('Please sign in to post a requirement');
      return;
    }
    if (!selectedArea) {
      toast.error('Please select an area first');
      return;
    }
    if (!reqForm.description.trim()) {
      toast.error('Please describe your requirement');
      return;
    }

    setReqSubmitting(true);
    try {
      const { error } = await supabase.from('area_requirements' as any).insert({
        user_id: user.id,
        area: selectedArea,
        city: selectedCity || 'Surat',
        property_type: reqForm.property_type,
        budget: reqForm.budget || null,
        bedrooms: reqForm.bedrooms || null,
        description: reqForm.description,
        phone: reqForm.phone || null,
        name: reqForm.name || user.user_metadata?.full_name || null,
      } as any);

      if (error) throw error;

      toast.success(`Requirement posted for ${selectedArea}! Brokers in this area will be notified.`);
      setShowRequirementForm(false);
      setReqForm({ description: '', property_type: 'any', budget: '', bedrooms: '', phone: '', name: '' });
    } catch (err) {
      console.error('Error posting requirement:', err);
      toast.error('Failed to post requirement. Please try again.');
    } finally {
      setReqSubmitting(false);
    }
  };

  const isSurat = selectedCity === 'Surat';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && window.innerWidth >= 768) {
          onClose();
        }
      }}
    >
      <div className="w-full h-full md:max-w-2xl md:h-[85vh] md:mx-auto md:my-auto md:mt-[7.5vh] flex flex-col bg-background md:shadow-2xl md:rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">City Chat</h3>
              <p className="text-xs text-muted-foreground">
                {selectedArea
                  ? `Chatting about ${selectedArea}, ${selectedCity}`
                  : selectedCity && selectedState 
                    ? `Chatting about ${selectedCity}, ${selectedState}` 
                    : "Select a city to start chatting"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={requestNotificationPermission}
              title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 text-primary" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Location Selection */}
        <div className="p-4 border-b border-border bg-background space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Select Location</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger className="bg-background border border-input hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 touch-manipulation">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border border-border shadow-xl z-[250] max-h-[200px] overflow-auto">
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state} className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedCity} 
              onValueChange={handleCityChange} 
              disabled={!selectedState}
            >
              <SelectTrigger className="bg-background border border-input hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border border-border shadow-xl z-[250] max-h-[200px] overflow-auto">
                {getCitiesForSelectedState().map((city) => (
                  <SelectItem key={city} value={city} className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area Search - shown only for Surat */}
          {isSurat && (
            <div className="relative" ref={areaDropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={areaInputRef}
                  value={areaSearch}
                  onChange={(e) => {
                    setAreaSearch(e.target.value);
                    setIsAreaDropdownOpen(true);
                    if (!e.target.value) setSelectedArea('');
                  }}
                  onFocus={() => setIsAreaDropdownOpen(true)}
                  placeholder="Search area in Surat..."
                  className="pl-9 pr-8 bg-background"
                />
                {selectedArea && (
                  <button
                    onClick={clearArea}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {isAreaDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-xl z-[260] max-h-[180px] overflow-auto">
                  {filteredAreas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-3">No areas found</p>
                  ) : (
                    filteredAreas.slice(0, 50).map((area) => (
                      <button
                        key={area}
                        onClick={() => handleAreaSelect(area)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                          selectedArea === area ? 'bg-accent text-accent-foreground font-medium' : ''
                        }`}
                      >
                        <MapPin className="h-3 w-3 inline mr-2 text-muted-foreground" />
                        {area}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Location badges + Post Requirement button */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {selectedCity && selectedState && (
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                {selectedCity}, {selectedState}
              </Badge>
            )}
            {selectedArea && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <MapPin className="h-3 w-3 mr-1" />
                {selectedArea}
              </Badge>
            )}
            {selectedArea && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 ml-auto text-xs border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setShowRequirementForm(!showRequirementForm)}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Post Requirement
              </Button>
            )}
          </div>
        </div>

        {/* Requirement Form */}
        {showRequirementForm && selectedArea && (
          <div className="p-4 border-b border-border bg-muted/30 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                Post Requirement for {selectedArea}
              </h4>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowRequirementForm(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Brokers serving {selectedArea} will be notified instantly about your requirement.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Your name"
                value={reqForm.name}
                onChange={(e) => setReqForm(f => ({ ...f, name: e.target.value }))}
                className="text-sm"
              />
              <Input
                placeholder="Phone number"
                value={reqForm.phone}
                onChange={(e) => setReqForm(f => ({ ...f, phone: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={reqForm.property_type} onValueChange={(v) => setReqForm(f => ({ ...f, property_type: v }))}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent className="z-[270]">
                  <SelectItem value="any">Any Type</SelectItem>
                  <SelectItem value="flat">Flat/Apartment</SelectItem>
                  <SelectItem value="house">House/Villa</SelectItem>
                  <SelectItem value="plot">Plot/Land</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="shop">Shop/Showroom</SelectItem>
                  <SelectItem value="office">Office Space</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Budget (e.g. 50L - 1Cr)"
                value={reqForm.budget}
                onChange={(e) => setReqForm(f => ({ ...f, budget: e.target.value }))}
                className="text-sm"
              />
            </div>
            <Select value={reqForm.bedrooms} onValueChange={(v) => setReqForm(f => ({ ...f, bedrooms: v }))}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Bedrooms (optional)" />
              </SelectTrigger>
              <SelectContent className="z-[270]">
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
                <SelectItem value="4">4 BHK</SelectItem>
                <SelectItem value="5+">5+ BHK</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Describe your requirement... (e.g. Looking for a 3BHK flat near school, ready to move)"
              value={reqForm.description}
              onChange={(e) => setReqForm(f => ({ ...f, description: e.target.value }))}
              className="text-sm min-h-[60px]"
            />
            <Button
              className="w-full gap-2"
              onClick={handleSubmitRequirement}
              disabled={reqSubmitting || !reqForm.description.trim()}
            >
              {reqSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {reqSubmitting ? 'Posting...' : 'Submit Requirement'}
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4 bg-background">
            <div className="space-y-4 min-h-full">
              {!selectedCity || !selectedState ? (
                <div className="text-center text-muted-foreground py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">Select a City to Start</p>
                  <p className="text-sm">Choose your state and city above to join the conversation</p>
                </div>
              ) : loadingMessages ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-sm">
                    Start the conversation about {selectedArea || selectedCity}!
                  </p>
                  {selectedArea && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-1.5"
                      onClick={() => setShowRequirementForm(true)}
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Post a Requirement
                    </Button>
                  )}
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.user_id === user?.id;
                  return (
                    <div key={message.id} className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn && (
                        <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                          <AvatarImage src={message.user_avatar || undefined} alt={message.user_name} />
                          <AvatarFallback className="text-xs bg-muted">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="space-y-1 max-w-[75%]">
                        {!isOwn && (
                          <p className="text-xs text-muted-foreground font-medium ml-1">{message.user_name}</p>
                        )}
                        <div className={`p-3 rounded-lg shadow-sm ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {isOwn && (
                        <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
                          <AvatarImage src={message.user_avatar || undefined} alt={message.user_name} />
                          <AvatarFallback className="text-xs bg-primary/20">
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                !user
                  ? "Sign in to chat..."
                  : selectedArea
                    ? `Message about ${selectedArea}...`
                    : selectedCity
                      ? `Message about ${selectedCity}...`
                      : "Select a city first..."
              }
              onKeyPress={(e) => e.key === 'Enter' && selectedCity && handleSendMessage(inputValue)}
              className="flex-1 bg-background"
              disabled={!selectedCity || !selectedState || !user}
            />
            <Button 
              size="icon" 
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || !selectedCity || !selectedState || !user}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!user && selectedCity && (
            <p className="text-xs text-muted-foreground mt-1 text-center">Please sign in to send messages</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationChat;
