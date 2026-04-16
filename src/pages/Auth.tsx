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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-11 gap-2"
                  onClick={async () => {
                    setLoading(true);
                    const result = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    if (result.error) {
                      toast({ title: "Google sign in failed", description: String(result.error), variant: "destructive" });
                      setLoading(false);
                    }
                    if (result.redirected) return;
                    setLoading(false);
                  }}
                  disabled={loading || emailLoading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  )}
                  Continue with Google
                </Button>

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
