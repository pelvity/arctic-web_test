import { SnippetForm } from "@/components/SnippetForm";

export default function NewSnippetPage() {
    return (
        <div className="py-8">
            <SnippetForm isEdit={false} />
        </div>
    );
}
