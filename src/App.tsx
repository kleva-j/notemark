import { AppLayout } from "@/components/layout/app-layout";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-screen">
        <Typography as="h2" variant="h2">
          Hello World
        </Typography>
        <Button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
      </div>
    </AppLayout>
  );
}

export default App;
