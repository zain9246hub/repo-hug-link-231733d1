import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50%" }}>
      Loading...
    </div>
  );
};

export default AuthCallback;