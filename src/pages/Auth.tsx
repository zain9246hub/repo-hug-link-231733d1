import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Briefcase, HardHat, ChevronRight, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "kureshizain04@gmail.com";

type UserRole = "owner" | "broker" | "builder";

const roles: { id: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "owner",
    label: "Owner",
    icon: <Home className="h-7 w-7" />,
    description: "I own a property and want to sell or rent it",
  },
  {
    id: "broker",
    label: "Broker",
    icon: <Briefcase className="h-7 w-7" />,
    description: "I'm a real estate broker managing listings",
  },
  {
    id: "builder",
    label: "Builder",
    icon: <HardHat className="h-7 w-7" />,
    description: "I'm a builder with new projects to list",
  },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<"role" | "login">("role");
  
  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const handleUser = async (userId: string, email: string | undefined) => {
      if (email === ADMIN_EMAIL) {
        navigate("/admin", { replace: true });
        return;
      }

      const { data: existing } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('user_id', userId)
        .maybeSingle();

      let profileRole = existing?.user_type || 'owner';

      if (!existing) {
        const validRoles = ['owner', 'broker', 'builder'];
        const storedRole = selectedRole || localStorage.getItem("bb_user_role") || '';
        const role = validRoles.includes(storedRole) ? storedRole : 'owner';
        await supabase.from('profiles').insert({
          user_id: userId,
          full_name: email || '',
          user_type: role,
        });
        profileRole = role;
      }

      localStorage.setItem("bb_user_role", profileRole);

      if (profileRole === "broker") {
        // Check if broker profile exists
        const { data: brokerProfile } = await supabase
          .from('brokers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (!brokerProfile) {
          navigate("/broker-onboarding", { replace: true });
        } else {
          navigate("/broker-dashboard", { replace: true });
        }
      } else if (profileRole === "builder") {
        navigate("/builder-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(false);
        setEmailLoading(false);
        await handleUser(session.user.id, session.user.email);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user.id, session.user.email);
      } else {
        setCheckingSession(false);
      }
    }).catch(() => {
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedRole]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem("bb_user_role", role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep("login");
    }
  };


  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setEmailLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + '/auth' },
      });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        setEmailLoading(false);
      } else {
        toast({ title: "Check your email", description: "We sent a verification link to your email address." });
        setEmailLoading(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
        setEmailLoading(false);
      }
      // On success, onAuthStateChange handles redirect
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/20 p-4">
      <AnimatePresence mode="wait">
        {step === "role" ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-sm">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto bg-gradient-primary rounded-full p-4 w-fit">
                  <Building2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                  Suratpropertyspot.in
                </CardTitle>
                <CardDescription>How would you like to use the app?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`rounded-full p-2.5 ${
                        selectedRole === role.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                    {selectedRole === role.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      </motion.div>
                    )}
                  </button>
                ))}

                <Button
                  className="w-full h-12 mt-4 text-base gap-2"
                  onClick={handleContinue}
                  disabled={!selectedRole}
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-sm">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto bg-gradient-primary rounded-full p-4 w-fit">
                  <Building2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                  Suratpropertyspot.in
                </CardTitle>
                <CardDescription>
                  Sign in as{" "}
                  <span className="font-semibold text-foreground capitalize">{selectedRole}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email/Password */}
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={emailLoading}
                  />
                  <Input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={emailLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                  />
                  <Button
                    className="w-full h-11 gap-2"
                    onClick={handleEmailAuth}
                    disabled={emailLoading || loading}
                  >
                    {emailLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {isSignUp ? "Sign Up" : "Sign In"} with Email
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                      className="text-primary font-medium underline"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => {
                    setStep("role");
                    setSelectedRole(null);
                  }}
                >
                  ← Change role
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
