import { Button } from "./ui/button";
import { buttonVariants } from "./ui/button";

export const Hero = () => {
  return (
    <section className="relative container py-20 md:py-32">
      {/* Shadow effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-[10%] bg-gradient-to-r from-pink-500 to-purple-500 opacity-30 blur-3xl rounded-full"></div>
      </div>
      
      <div className="text-center space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            Simplifying{" "}
            <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
              File Sharing
            </span>{" "}
          </h1>{" "}
          for{" "}
          <h2 className="inline">
            Everyone
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto">
          Upload and share files seamlessly with our secure and easy-to-use platform. No sign-up required.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
        <Button className="w-full md:w-1/3">Start Uploading</Button>

          <Button className={`w-full md:w-1/3 text-white ${buttonVariants({
            variant: "outline",
          })}`}>Learn More</Button>
        </div>
      </div>

      {/* Hero cards sections */}
      {/* <div className="z-10">
        <HeroCards />
      </div> */}
    </section>
  );
};