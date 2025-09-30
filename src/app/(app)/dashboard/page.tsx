
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { menuItems } from "@/config/nav";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import AppLayout from "../layout";

export default function DashboardPage() {
  const tools = menuItems.filter(item => item.href !== '/dashboard');

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome to FIXpert</h1>
          <p className="text-lg text-muted-foreground">Your all-in-one toolkit for the FIX Protocol. Select a tool to get started.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.href} className="flex flex-col justify-between transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1">
              <div>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold">{tool.label}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <tool.icon className="h-6 w-6" />
                  </div>
                </CardHeader>
              </div>
              <CardContent>
                <Link href={tool.href}>
                  <Button variant="outline" className="w-full">
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
