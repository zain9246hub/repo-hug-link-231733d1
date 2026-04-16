import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Briefcase, HardHat, ChevronRight, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAIL = "kureshizain04@gmail.com";

type UserRole = "owner" | "broker" | "builder";

const roles = [
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
        .from("profiles")
        .select("id, user_type")
        .eq("user_id", userId)
        .maybeSingle();

      let profileRole = existing?.user_type || "owner";

      if (!existing) {
        const storedRole = selectedRole || localStorage.getItem("bb_user_role") || "owner";

        await supabase.from("profiles").insert({
          user_id: userId,
          full_name: email || "",
          user_type: storedRole,
        });

        profileRole = storedRole;
      }

      localStorage.setItem("bb_user_role", profileRole);

      if (profileRole === "broker") {
        navigate("/broker-dashboard", { replace: true });
      } else if (profileRole === "builder") {
        navigate("/builder-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setLoading(false);
          setEmailLoading(false);
          await handleUser(session.user.id, session.user.email);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUser(session.user.id, session.user.email);
      } else {
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedRole]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem("bb_user_role", role);
  };

  const handleContinue = () => {
    if (selectedRole) setStep("login");
  };

  // ✅ FIXED GOOGLE LOGIN
  const handleGoogleSignIn = async () => {
    setLoading(true);

    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth/callback",
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: "Could not sign in",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === "role" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Select Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id as UserRole)}
                    className="w-full text-left"
                  >
                    {role.label}
                  </button>
                ))}
                <Button onClick={handleContinue}>Continue</Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <Button onClick={handleGoogleSignIn}>
                  {loading ? "Redirecting..." : "Continue with Google"}
                </Button>

                <Input
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button>
                  {isSignUp ? "Sign Up" : "Sign In"}
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