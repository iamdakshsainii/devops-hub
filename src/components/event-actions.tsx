"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Bell, BellOff, BookmarkCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface EventActionsProps {
    eventId: string;
    isPast?: boolean;
}

export function EventActions({ eventId, isPast = false }: EventActionsProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const [saved, setSaved] = useState(false);
    const [remindMe, setRemindMe] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingRemind, setLoadingRemind] = useState(false);

    // Fetch current bookmark state for this event
    useEffect(() => {
        if (!session?.user?.id) return;
        fetch(`/api/bookmark?itemId=${eventId}&itemType=EVENT`)
            .then((r) => r.json())
            .then((data) => {
                setSaved(data.saved ?? false);
                setRemindMe(data.remindMe ?? false);
            })
            .catch(() => { });
    }, [eventId, session?.user?.id]);

    const handleSave = async () => {
        if (!session) { router.push("/login"); return; }
        setLoadingSave(true);
        try {
            const res = await fetch("/api/bookmark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: eventId, itemType: "EVENT" }),
            });
            const data = await res.json();
            if (data.status === "removed") {
                setSaved(false);
                setRemindMe(false); // removing bookmark also clears reminder
            } else {
                setSaved(true);
            }
        } catch { }
        setLoadingSave(false);
    };

    const handleRemindMe = async () => {
        if (!session) { router.push("/login"); return; }
        if (isPast) return; // no reminders for past events

        setLoadingRemind(true);
        try {
            const newRemindMe = !remindMe;

            if (!saved) {
                // Create bookmark with remindMe: true in one shot
                const res = await fetch("/api/bookmark", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ itemId: eventId, itemType: "EVENT", remindMe: true }),
                });
                const data = await res.json();
                setSaved(true);
                setRemindMe(data.remindMe ?? true);
            } else {
                // Bookmark exists — just toggle remindMe flag
                const res = await fetch("/api/bookmark", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ itemId: eventId, itemType: "EVENT", remindMe: newRemindMe }),
                });
                const data = await res.json();
                setRemindMe(data.remindMe ?? newRemindMe);
            }
        } catch { }
        setLoadingRemind(false);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Save button */}
            <Button
                variant="outline"
                size="sm"
                className={`h-8 gap-1.5 text-xs transition-colors ${saved
                        ? "text-primary border-primary/40 bg-primary/5"
                        : "text-muted-foreground"
                    }`}
                onClick={handleSave}
                disabled={loadingSave}
                title={saved ? "Remove from saved" : "Save event"}
            >
                {saved ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                )}
                {saved ? "Saved" : "Save"}
            </Button>

            {/* Remind Me button — hidden for past events */}
            {!isPast && (
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 gap-1.5 text-xs transition-colors ${remindMe
                            ? "text-amber-500 border-amber-500/40 bg-amber-500/5"
                            : "text-muted-foreground"
                        }`}
                    onClick={handleRemindMe}
                    disabled={loadingRemind}
                    title={remindMe ? "Remove reminder" : "Remind me on event day"}
                >
                    {remindMe ? (
                        <BellOff className="h-3.5 w-3.5" />
                    ) : (
                        <Bell className="h-3.5 w-3.5" />
                    )}
                    {remindMe ? "Reminded" : "Remind Me"}
                </Button>
            )}
        </div>
    );
}
