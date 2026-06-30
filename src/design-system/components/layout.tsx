import * as React from "react";
import { cn } from "@/design-system/lib/utils";

function DesignSystemSurface({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-screen bg-background text-foreground", className)} {...props} />;
}

function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-10 sm:py-12", className)} {...props} />;
}

function Stack({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-4", className)} {...props} />;
}

function Cluster({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)} {...props} />;
}

function ResponsiveGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      {...props}
    />
  );
}

function SplitLayout({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]", className)} {...props} />;
}

export { Cluster, Container, DesignSystemSurface, ResponsiveGrid, Section, SplitLayout, Stack };

