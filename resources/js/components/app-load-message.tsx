import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Eye, MessageCircleMore } from 'lucide-react';
import { useState } from 'react';

type LoadMessage = {
    id: number;
    status: boolean;
    message: string;
};

export function AppLoadMessage({ message }: { message: LoadMessage }) {
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        router.patch(route('app.messages.read', message.id), {
            status: message.status ? false : true,
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" size="icon">
                    <Eye />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircleMore /> Ler mensagem
                    </DialogTitle>
                    <DialogDescription>
                        Para marcar a mensage como lida clique em marcar como lida, ou para sair sem ler clique em sair.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid rounded-md border-t bg-gray-50">
                    <h1 className="border-b border-gray-200 px-2 py-1 text-lg font-bold text-gray-600">Mensagem</h1>
                    <p className="p-2 text-sm text-gray-500">{message.message}</p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Sair</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} type="submit">
                        {message.status ? 'Marcar como não lida' : 'Marcar como lida'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
