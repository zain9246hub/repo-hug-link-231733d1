import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        console.log("Auth result:", data, error);

        if (error) {
          console.error("OAuth error:", error.message);
          navigate("/auth");
          return;
        }

        if (data?.session) {
          navigate("/", { replace: true });
        } else {
          navigate("/auth", { replace: true });
        }

      } catch (err) {
        console.error("Crash:", err);
        navigate("/auth");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50%" }}>
      Processing login...
    </div>
  );
};

export default AuthCallback;