
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { menuItems } from "@/config/nav";
import Link from "next/link";
import { ArrowRight, Newspaper, Landmark, BookCopy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { getTrendingNews } from "@/app/actions/symbol-search.actions";
import { formatDistanceToNow } from 'date-fns';

const exchanges = [
    { name: "NASDAQ", url: "https://www.nasdaq.com/" },
    { name: "New York Stock Exchange", url: "https://www.nyse.com/" },
    { name: "London Stock Exchange", url: "https://www.londonstockexchange.com/" },
    { name: "Tokyo Stock Exchange", url: "https://www.jpx.co.jp/english/" },
];

const fixResources = [
    { name: "FIX Trading Community", url: "https://www.fixtrading.org/" },
    { name: "OnixS FIX Dictionary", url: "https://www.onixs.biz/fix-dictionary" },
    { name: "FIX Protocol Explained", url: "https://www.investopedia.com/terms/f/fix.asp" },
    { name: "FIXwiki", url: "https://fixwiki.org/" },
];

const QuickLink = ({ name, url }: { name: string; url: string }) => (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
        <span className="text-sm font-medium">{name}</span>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
    </Link>
);


export default async function DashboardPage() {
  const tools = menuItems.filter(item => item.href !== '/dashboard');
  const news = await getTrendingNews();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome to FIXpert</h1>
        <p className="text-lg text-muted-foreground">Your all-in-one toolkit for the FIX Protocol. Select a tool or browse the latest news.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Newspaper className="h-6 w-6 text-primary" />
                    <CardTitle>Top Financial News</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {news.slice(0, 7).map((item, index) => (
                        <Link key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg border hover:bg-muted/50">
                            <p className="font-semibold text-base hover:underline">{item.title}</p>
                            <p className="text-xs text-muted-foreground pt-1">
                                {item.publisher} &bull; {formatDistanceToNow(new Date(item.providerPublishTime * 1000), { addSuffix: true })}
                            </p>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
           <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Landmark className="h-6 w-6 text-primary" />
                    <CardTitle>Market Exchanges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    {exchanges.map(exchange => <QuickLink key={exchange.name} {...exchange} />)}
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <BookCopy className="h-6 w-6 text-primary" />
                    <CardTitle>FIX Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    {fixResources.map(resource => <QuickLink key={resource.name} {...resource} />)}
                </CardContent>
            </Card>
        </div>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Toolkit</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
}
