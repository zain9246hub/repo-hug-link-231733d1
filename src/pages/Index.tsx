import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">

      <h1 className="text-2xl font-bold mb-4 text-black">
        App Working ✅
      </h1>

      <p className="text-gray-600 mb-6 text-center">
        Your project is now loading correctly.
      </p>

      <div className="flex gap-3">
        <Button onClick={() => navigate("/auth")}>
          Go to Auth
        </Button>

        <Button variant="outline" onClick={() => navigate("/search")}>
          Search Properties
        </Button>
      </div>

    </div>
  );
};

export default Index;