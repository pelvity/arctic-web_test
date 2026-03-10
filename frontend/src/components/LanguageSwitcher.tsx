"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "./ui/button";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLocale = () => {
        const nextLocale = locale === "en" ? "uk" : "en";
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className="rounded-full w-12 text-xs font-semibold tracking-wider opacity-80 hover:opacity-100"
        >
            {locale === "en" ? "EN" : "UA"}
        </Button>
    );
}
