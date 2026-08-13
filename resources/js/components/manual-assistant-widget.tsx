import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { BotMessageSquare, Loader2Icon, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

type Exchange = {
    id: string;
    question: string;
    answer?: string;
    error?: string;
};

export default function ManualAssistantWidget() {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<Exchange[]>([]);

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmed = question.trim();
        if (!trimmed || loading) {
            return;
        }

        const id = `${Date.now()}`;
        setHistory((current) => [...current, { id, question: trimmed }]);
        setQuestion('');
        setLoading(true);

        try {
            const response = await axios.post<{ answer: string }>(route('app.manual-assistant.ask'), {
                question: trimmed,
            });

            setHistory((current) => current.map((item) => (item.id === id ? { ...item, answer: response.data.answer } : item)));
        } catch (error: any) {
            const message = error?.response?.data?.message ?? 'Não foi possível obter resposta do assistente agora. Tente novamente em instantes.';

            setHistory((current) => current.map((item) => (item.id === id ? { ...item, error: message } : item)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Button
                type="button"
                size="icon"
                onClick={() => setOpen(true)}
                title="Assistente do manual"
                aria-label="Abrir assistente do manual"
                className="fixed right-6 bottom-6 z-40 h-14 w-14 rounded-full shadow-lg"
            >
                <BotMessageSquare className="h-6 w-6" />
            </Button>

            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Assistente do manual
                    </SheetTitle>
                    <SheetDescription>Tire dúvidas sobre o uso do VetorOS. As respostas são geradas com base no manual do sistema.</SheetDescription>
                </SheetHeader>

                <ScrollArea className="min-h-0 flex-1 px-4">
                    <div className="flex flex-col gap-4 pb-4">
                        {history.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                Pergunte algo como &ldquo;como funciona a garantia de uma OS?&rdquo; ou &ldquo;como registro uma sangria de
                                caixa?&rdquo;.
                            </p>
                        )}

                        {history.map((item) => (
                            <div key={item.id} className="flex flex-col gap-2">
                                <div className="bg-primary text-primary-foreground ml-auto max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2 text-sm">
                                    {item.question}
                                </div>

                                {item.answer && (
                                    <div className="bg-muted mr-auto max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2 text-sm whitespace-pre-wrap">
                                        {item.answer}
                                    </div>
                                )}

                                {item.error && (
                                    <div className="border-destructive/30 bg-destructive/10 text-destructive mr-auto max-w-[85%] rounded-2xl rounded-bl-sm border px-4 py-2 text-sm">
                                        {item.error}
                                    </div>
                                )}

                                {!item.answer && !item.error && (
                                    <div className="bg-muted text-muted-foreground mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-sm px-4 py-2 text-sm">
                                        <Loader2Icon className="h-4 w-4 animate-spin" />
                                        Consultando o manual...
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <form onSubmit={submit} className="flex items-start gap-2 border-t p-4">
                    <div className="flex-1">
                        <Textarea
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                            placeholder="Digite sua dúvida sobre o sistema..."
                            rows={2}
                            maxLength={2000}
                            className="resize-none"
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" size="icon" disabled={loading || !question.trim()} aria-label="Enviar pergunta">
                        {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}
