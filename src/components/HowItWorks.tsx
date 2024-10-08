import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ClockIcon, LinkIcon, ShareIcon, UploadIcon } from "./Icons";
import React from "react";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <UploadIcon />,
    title: "Upload",
    description:
      "Choose your file(s) and upload."
  },
  {
    icon: <ClockIcon />,
    title: "Customize",
    description:
      "Set expiry and access controls."
  },
  {
    icon: <LinkIcon />,
    title: "Get Link",
    description:
      "Get a secure link to share."
  },
  {
    icon: <ShareIcon />,
    title: "Share",
    description:
      "Send the link or QR code to your recipients."
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2><br/><br/>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
        {features.map(({ icon, title, description }: FeatureProps, index) => (
          <React.Fragment key={title}>
            <Card className="bg-muted/50 w-full lg:w-64">
              <CardHeader>
                <CardTitle className="grid gap-4 place-items-center">
                  {icon}
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>{description}</CardContent>
            </Card>
            {index < features.length - 1 && (
              <div className="hidden lg:flex items-center text-primary text-6xl">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
