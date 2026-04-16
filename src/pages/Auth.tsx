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
        const validRoles = ["owner", "broker", "builder"];
        const storedRole = selectedRole || localStorage.getItem("bb_user_role") || "";
        const role = validRoles.includes(storedRole) ? storedRole : "owner";

        await supabase.from("profiles").insert({
          user_id: userId,
          full_name: email || "",
          user_type: role,
        });

        profileRole = role;
      }

      localStorage.setItem("bb_user_role", profileRole);

      if (profileRole === "broker") {
        const { data: brokerProfile } = await supabase
          .from("brokers")
          .select("id")
          .eq("user_id", userId)
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
      redirect_uri: "https://suratpropertyspot.in/"
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: "Could not sign in. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Enter email & password",
        variant: "destructive",
      });
      return;
    }

    setEmailLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://suratpropertyspot.in/"
        },
      });

      if (error) {
        toast({ title: "Error", description: error.message });
        setEmailLoading(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ title: "Error", description: error.message });
        setEmailLoading(false);
      }
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
      {step === "role" ? (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Select Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles.map((r) => (
              <button key={r.id} onClick={() => handleRoleSelect(r.id)}>
                {r.label}
              </button>
            ))}
            <Button onClick={handleContinue}>Continue</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <Button onClick={handleGoogleSignIn}>
              {loading ? "Redirecting..." : "Login with Google"}
            </Button>

            <Input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button onClick={handleEmailAuth}>
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>

          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Auth;