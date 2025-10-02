"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [formData, setFormData] = useState({
    email: "",
    github_url: "",
    website_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validateEmail(formData.email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    if (!validateUrl(formData.github_url)) {
      toast.error("Veuillez entrer une URL GitHub valide");
      return;
    }

    if (!validateUrl(formData.website_url)) {
      toast.error("Veuillez entrer une URL de site web valide");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("student_submissions")
        .insert([
          {
            email: formData.email,
            github_url: formData.github_url,
            website_url: formData.website_url,
          },
        ]);

      if (error) {
        if (error.code === "23505") {
          toast.error("Cet email a déjà été soumis");
        } else {
          toast.error("Une erreur est survenue. Veuillez réessayer.");
        }
        return;
      }

      toast.success("Votre soumission a été enregistrée avec succès!");
      setFormData({ email: "", github_url: "", website_url: "" });
    } catch (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background via-background to-card">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg mb-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Portail Étudiant
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto">
            Soumettez vos informations de projet pour validation
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Soumettre mon projet</CardTitle>
            <CardDescription>
              Entrez votre email, l&apos;URL de votre repository GitHub et l&apos;URL de votre site web déployé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-input/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url" className="text-sm font-medium">
                  URL du Repository GitHub
                </Label>
                <Input
                  id="github_url"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  required
                  className="bg-input/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url" className="text-sm font-medium">
                  URL du Site Web
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://votre-site.com"
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                  required
                  className="bg-input/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6 text-base transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  "Soumettre"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Assurez-vous que toutes les informations sont correctes avant de soumettre.
        </p>
      </div>
    </div>
  );
}
