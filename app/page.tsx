"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

type TerminalPhase = "boot" | "welcome" | "email" | "github" | "website" | "workshop" | "confirm" | "submitting" | "complete";

interface TerminalLine {
  text: string;
  type: "system" | "prompt" | "input" | "error" | "success";
}

export default function Home() {
  const [phase, setPhase] = useState<TerminalPhase>("boot");
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    github_url: "",
    website_url: "",
    workshop: "Workshop 3",
  });
  const [workshopSelection, setWorkshopSelection] = useState<"Workshop 3" | "Workshop 4 & 5" | "Workshop 6">("Workshop 3");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // Auto-focus input
  useEffect(() => {
    if (phase !== "boot" && phase !== "welcome" && phase !== "submitting" && phase !== "complete" && phase !== "workshop") {
      inputRef.current?.focus();
    } else if (phase === "workshop") {
      // Focus input for arrow key detection
      inputRef.current?.focus();
    }
  }, [phase]);

  // Boot sequence
  useEffect(() => {
    if (phase === "boot") {
      const bootMessages = [
        "Initializing Student Portal v1.0.0...",
        "Loading system modules...",
        "Checking database connection...",
        "Establishing secure connection to Supabase...",
        "Security protocols enabled",
        "System ready.",
        "",
      ];

      let index = 0;
      const bootInterval = setInterval(() => {
        if (index < bootMessages.length) {
          setLines((prev) => [...prev, { text: bootMessages[index], type: "system" }]);
          index++;
        } else {
          clearInterval(bootInterval);
          setTimeout(() => setPhase("welcome"), 500);
        }
      }, 300);

      return () => clearInterval(bootInterval);
    }
  }, [phase]);

  // Welcome message
  useEffect(() => {
    if (phase === "welcome") {
      const welcomeMessages = [
        "",
        "+===============================================+",
        "|  PORTAIL ÉTUDIANT - SOUMISSION PROJET        |",
        "|             Version 1.0.0                    |",
        "+===============================================+",
        "",
        "Bienvenue dans le système de soumission de projet.",
        "Veuillez répondre aux questions suivantes.",
        "",
      ];

      let index = 0;
      const welcomeInterval = setInterval(() => {
        if (index < welcomeMessages.length) {
          setLines((prev) => [...prev, { text: welcomeMessages[index], type: "system" }]);
          index++;
        } else {
          clearInterval(welcomeInterval);
          setTimeout(() => {
            setLines((prev) => [...prev, { text: "> Entrez votre adresse email:", type: "prompt" }]);
            setPhase("email");
          }, 500);
        }
      }, 150);

      return () => clearInterval(welcomeInterval);
    }
  }, [phase]);

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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle arrow keys in workshop phase
    if (phase === "workshop") {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const workshops = ["Workshop 3", "Workshop 4 & 5", "Workshop 6"] as const;
        const currentIndex = workshops.indexOf(workshopSelection);
        let newIndex: number;

        if (e.key === "ArrowDown") {
          newIndex = (currentIndex + 1) % workshops.length;
        } else {
          newIndex = (currentIndex - 1 + workshops.length) % workshops.length;
        }

        const newSelection = workshops[newIndex];
        setWorkshopSelection(newSelection);

        // Update the last 4 lines to reflect new selection
        setLines((prev) => {
          const newLines = [...prev];
          const len = newLines.length;
          newLines[len - 3] = {
            text: newSelection === "Workshop 3" ? "  > Workshop 3" : "    Workshop 3",
            type: newSelection === "Workshop 3" ? "success" : "system"
          };
          newLines[len - 2] = {
            text: newSelection === "Workshop 4 & 5" ? "  > Workshop 4 & 5" : "    Workshop 4 & 5",
            type: newSelection === "Workshop 4 & 5" ? "success" : "system"
          };
          newLines[len - 1] = {
            text: newSelection === "Workshop 6" ? "  > Workshop 6" : "    Workshop 6",
            type: newSelection === "Workshop 6" ? "success" : "system"
          };
          return newLines;
        });
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        setFormData((prev) => ({ ...prev, workshop: workshopSelection }));
        setLines((prev) => [...prev, { text: `✓ ${workshopSelection} sélectionné`, type: "success" }]);
        setLines((prev) => [...prev, { text: "", type: "system" }]);
        setLines((prev) => [
          ...prev,
          { text: "═══════════════════════════════════════", type: "system" },
          { text: "RÉCAPITULATIF DES INFORMATIONS", type: "system" },
          { text: "═══════════════════════════════════════", type: "system" },
          { text: `Email:        ${formData.email}`, type: "system" },
          { text: `GitHub:       ${formData.github_url}`, type: "system" },
          { text: `Site Web:     ${formData.website_url}`, type: "system" },
          { text: `Workshop:     ${workshopSelection}`, type: "system" },
          { text: "═══════════════════════════════════════", type: "system" },
          { text: "", type: "system" },
          { text: "> Confirmer la soumission? (oui/non):", type: "prompt" },
        ]);
        setPhase("confirm");
        return;
      }
    }

    if (e.key === "Enter" && currentInput.trim()) {
      e.preventDefault();

      // Add input to terminal
      setLines((prev) => [...prev, { text: `$ ${currentInput}`, type: "input" }]);

      if (phase === "email") {
        if (validateEmail(currentInput)) {
          setFormData((prev) => ({ ...prev, email: currentInput }));
          setLines((prev) => [...prev, { text: "✓ Email valide", type: "success" }]);
          setLines((prev) => [...prev, { text: "", type: "system" }]);
          setLines((prev) => [...prev, { text: "> Entrez l'URL de votre repository GitHub:", type: "prompt" }]);
          setPhase("github");
        } else {
          setLines((prev) => [...prev, { text: "✗ Email invalide. Réessayez:", type: "error" }]);
        }
        setCurrentInput("");
      } else if (phase === "github") {
        if (validateUrl(currentInput)) {
          setFormData((prev) => ({ ...prev, github_url: currentInput }));
          setLines((prev) => [...prev, { text: "✓ URL GitHub valide", type: "success" }]);
          setLines((prev) => [...prev, { text: "", type: "system" }]);
          setLines((prev) => [...prev, { text: "> Entrez l'URL de votre site web:", type: "prompt" }]);
          setPhase("website");
        } else {
          setLines((prev) => [...prev, { text: "✗ URL invalide. Réessayez:", type: "error" }]);
        }
        setCurrentInput("");
      } else if (phase === "website") {
        if (validateUrl(currentInput)) {
          setFormData((prev) => ({ ...prev, website_url: currentInput }));
          setLines((prev) => [...prev, { text: "✓ URL site web valide", type: "success" }]);
          setLines((prev) => [...prev, { text: "", type: "system" }]);
          setLines((prev) => [...prev, { text: "> Sélectionnez votre workshop (utilisez ↑/↓ puis Entrée):", type: "prompt" }]);
          setLines((prev) => [...prev, { text: "", type: "system" }]);
          setLines((prev) => [...prev, { text: "  > Workshop 3", type: "success" }]);
          setLines((prev) => [...prev, { text: "    Workshop 4 & 5", type: "system" }]);
          setLines((prev) => [...prev, { text: "    Workshop 6", type: "system" }]);
          setPhase("workshop");
        } else {
          setLines((prev) => [...prev, { text: "✗ URL invalide. Réessayez:", type: "error" }]);
        }
        setCurrentInput("");
      } else if (phase === "confirm") {
        const answer = currentInput.toLowerCase();
        if (answer === "oui" || answer === "o" || answer === "y" || answer === "yes") {
          setLines((prev) => [...prev, { text: "", type: "system" }]);
          setLines((prev) => [...prev, { text: "Envoi en cours...", type: "system" }]);
          setPhase("submitting");
          setCurrentInput("");

          try {
            const { error } = await supabase.from("student_submissions").insert([formData]);

            if (error) {
              if (error.code === "23505") {
                setLines((prev) => [...prev, { text: "✗ ERREUR: Cet email a déjà été soumis", type: "error" }]);
              } else {
                setLines((prev) => [...prev, { text: "✗ ERREUR: Une erreur est survenue", type: "error" }]);
              }
              setLines((prev) => [...prev, { text: "", type: "system" }]);
              setLines((prev) => [...prev, { text: "Appuyez sur Enter pour recommencer...", type: "prompt" }]);
              setPhase("complete");
            } else {
              setLines((prev) => [
                ...prev,
                { text: "✓ Soumission réussie!", type: "success" },
                { text: "", type: "system" },
                { text: "Votre projet a été enregistré avec succès.", type: "system" },
                { text: "Merci d'avoir utilisé le portail étudiant.", type: "system" },
                { text: "", type: "system" },
              ]);

              // Hack animation
              setTimeout(() => {
                const hackMessages = [
                  "AVERTISSEMENT: Activité suspecte détectée...",
                  "Scanning system files...",
                  "ACCESS DENIED",
                  ">>> Intrusion detected <<<",
                  "FIREWALL BREACH ATTEMPT",
                  "System override initiated...",
                  "4cC3$$ Gr4nT3D",
                  "01001000 01000001 01000011 01001011",
                  "Matrix breach in progress...",
                  "Decrypting mainframe...",
                  "Root access: GRANTED",
                  "---SYSTEM COMPROMISED---",
                  "Just kidding! 😎",
                  "",
                  "Tout est sous contrôle.",
                  "Votre soumission est bien sécurisée.",
                  "",
                  "Appuyez sur Enter pour soumettre un autre projet...",
                ];

                let hackIndex = 0;
                const hackInterval = setInterval(() => {
                  if (hackIndex < hackMessages.length) {
                    const msg = hackMessages[hackIndex];
                    const isGlitch = hackIndex >= 2 && hackIndex <= 11;
                    setLines((prev) => [
                      ...prev,
                      { text: msg, type: isGlitch ? "error" : "system" },
                    ]);
                    hackIndex++;
                  } else {
                    clearInterval(hackInterval);
                    setPhase("complete");
                  }
                }, hackIndex < 12 ? 200 : 400);
              }, 1000);
            }
          } catch {
            setLines((prev) => [...prev, { text: "✗ ERREUR: Connexion impossible", type: "error" }]);
            setPhase("complete");
          }
        } else if (answer === "non" || answer === "n" || answer === "no") {
          setLines((prev) => [...prev, { text: "Soumission annulée.", type: "system" }]);
          setLines((prev) => [...prev, { text: "", type: "system" }]);
          setLines((prev) => [...prev, { text: "Appuyez sur Enter pour recommencer...", type: "prompt" }]);
          setPhase("complete");
          setCurrentInput("");
        } else {
          setLines((prev) => [...prev, { text: "✗ Réponse invalide. Tapez 'oui' ou 'non':", type: "error" }]);
          setCurrentInput("");
        }
      } else if (phase === "complete") {
        // Reset
        setLines([]);
        setFormData({ email: "", github_url: "", website_url: "", workshop: "Workshop 3" });
        setWorkshopSelection("Workshop 3");
        setCurrentInput("");
        setPhase("boot");
      }
    }
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case "error":
        return "text-destructive";
      case "success":
        return "text-primary";
      case "prompt":
        return "text-primary font-bold";
      case "input":
        return "text-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      {/* Terminal scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(111,218,111,0.03)_0px,transparent_1px,transparent_2px,rgba(111,218,111,0.03)_3px)]" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="border-2 border-primary bg-black p-6 min-h-[600px] max-h-[80vh] overflow-y-auto">
          {/* Terminal output */}
          <div className="space-y-1 font-mono text-sm">
            {lines.map((line, index) => (
              <div key={index} className={getLineColor(line.type)} style={{ whiteSpace: 'pre' }}>
                {line.text || '\u00A0'}
              </div>
            ))}

            {/* Current input line */}
            {phase !== "boot" && phase !== "welcome" && phase !== "submitting" && phase !== "complete" && phase !== "workshop" && (
              <div className="flex items-center gap-2 text-primary">
                <span>$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-primary font-mono caret-primary"
                  autoFocus
                />
                <span className="animate-pulse">_</span>
              </div>
            )}

            {/* Workshop selection - hidden input for arrow key detection */}
            {phase === "workshop" && (
              <input
                ref={inputRef}
                type="text"
                value=""
                onChange={() => {}}
                onKeyDown={handleKeyDown}
                className="w-0 h-0 opacity-0 absolute"
                autoFocus
              />
            )}

            {phase === "complete" && (
              <div className="flex items-center gap-2 text-primary">
                <span>$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-primary font-mono caret-primary"
                  autoFocus
                />
                <span className="animate-pulse">_</span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Terminal info bar */}
        <div className="border-2 border-t-0 border-primary bg-black px-6 py-2 flex justify-between items-center text-xs font-mono">
          <span className="text-muted-foreground">Student Portal Terminal v1.0.0</span>
          <span className="text-muted-foreground">
            {phase === "boot" && "BOOTING..."}
            {phase === "welcome" && "INITIALIZING..."}
            {phase === "email" && "COLLECTING DATA [1/4]"}
            {phase === "github" && "COLLECTING DATA [2/4]"}
            {phase === "website" && "COLLECTING DATA [3/4]"}
            {phase === "workshop" && "COLLECTING DATA [4/4]"}
            {phase === "confirm" && "AWAITING CONFIRMATION"}
            {phase === "submitting" && "SUBMITTING..."}
            {phase === "complete" && "READY"}
          </span>
        </div>
      </div>
    </div>
  );
}
