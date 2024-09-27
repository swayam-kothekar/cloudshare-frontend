import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MagnifierIcon, WalletIcon, ChartIcon } from "./Icons";
import { Badge } from "./ui/badge";
import cubeLeg from "../assets/cube-leg.png";

interface FeatureProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const features: FeatureProps[] = [
  {
    title: "Anonymous Sharing",
    description:
      "Share files without the need to create an account. Maintain your privacy while sharing documents or media.",
    icon: <ChartIcon />,
  },
  {
    title: "End-to-End Encryption",
    description:
      "Keep your files safe with industry-standard end-to-end encryption. Only you and the recipient can access your shared content.",
    icon: <WalletIcon />,
  },
  {
    title: "Customizable Links",
    description:
      "Generate secure links with customizable expiry dates, access permissions, and download limits to control how your files are shared.",
    icon: <MagnifierIcon />,
  },
  {
    title: "Fast Uploads",
    description:
      "Upload large files quickly and securely without long wait times. Our platform is optimized for fast and reliable file transfers.",
    icon: <ChartIcon />,
  },
];

const featureList: string[] = [
  "Dark/Light theme",
  "Reviews",
  "Features",
  "Pricing",
  "Contact form",
  "Our team",
  "Responsive design",
  "Newsletter",
  "Minimalist",
];

export const Features = () => {
  return (
    // <section
    //   id="features"
    //   className="container py-24 sm:py-32 space-y-8"
    // >
    //   <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
    //     Many{" "}
    //     <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
    //       Great Features
    //     </span>
    //   </h2>

    //   <div className="flex flex-wrap md:justify-center gap-4">
    //     {featureList.map((feature: string) => (
    //       <div key={feature}>
    //         <Badge
    //           variant="secondary"
    //           className="text-sm"
    //         >
    //           {feature}
    //         </Badge>
    //       </div>
    //     ))}
    //   </div>

    //   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    //     {features.map(({ title, description, image }: FeatureProps) => (
    //       <Card key={title}>
    //         <CardHeader>
    //           <CardTitle>{title}</CardTitle>
    //         </CardHeader>

    //         <CardContent>{description}</CardContent>

    //         <CardFooter>
    //           <img
    //             src={image}
    //             alt="About feature"
    //             className="w-[200px] lg:w-[300px] mx-auto"
    //           />
    //         </CardFooter>
    //       </Card>
    //     ))}
    //   </div>
    // </section>

    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Great Features
        </span>
      </h2>
      <br />
      <br />

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge variant="secondary" className="text-sm">
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <br />
      <br />
      <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
        <div>
          <div className="flex flex-col gap-8">
            {features.map(({ icon, title, description }: FeatureProps) => (
              <Card key={title}>
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <img
          src={cubeLeg}
          className="w-[300px] md:w-[500px] lg:w-[600px] object-contain"
          alt="About services"
        />
      </div>
    </section>
  );
};
