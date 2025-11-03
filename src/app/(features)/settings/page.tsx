"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AppSettings } from "@/lib/types";
import { appSettings as initialAppSettings } from "@/lib/data";
import useLocalStorage from "@/hooks/use-local-storage";

const formSchema = z.object({
  // Since time tracking is moved, we can have an empty schema or add other settings later
});

export default function SettingsPage() {
  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>(
    "appSettings",
    initialAppSettings
  );
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // We would update other settings here if there were any
    toast({
      title: "Settings Updated",
      description: "Your settings have been saved successfully.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your application settings and personal preferences.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">&quot;Tough Love&quot; Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get realistic, sometimes harsh, reminders to stay on track.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
