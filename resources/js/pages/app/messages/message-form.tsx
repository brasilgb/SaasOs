import { Breadcrumbs } from "@/components/breadcrumbs";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Message, User } from "@/types";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, MessageSquareMore, Save } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from 'react-select';
import InputError from "@/components/input-error";
import { Switch } from "@/components/ui/switch";
import { toastSuccess } from "@/components/app-toast-messages";

interface MessageFormProps {
  initialData?: Message;
  users: User[];
}


export default function MessageForm({ users, initialData }: MessageFormProps) {
  const { auth } = usePage().props as any;

  const isEdit = !!initialData
  const canEdit = !isEdit || initialData?.sender_id === auth.user.id
  const optionsUser = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));

  const { data, setData, post, patch, progress, processing, reset, errors } = useForm({
    'sender_id': auth.user.id ?? "",
    'recipient_id': initialData?.recipient_id ?? "",
    'title': initialData?.title ?? "",
    'message': initialData?.message ?? "",
    'status': initialData?.status ?? false,
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (isEdit) {
      patch(route("app.messages.update", initialData!.id), {
        onSuccess: () => {
          toastSuccess("Sucesso", "Mensagem atualizada com sucesso")
        },
      })
    } else {
      post(route("app.messages.store"), {
        onSuccess: () => {
          toastSuccess("Sucesso", "Mensagem criado com sucesso")
          reset()
        },
      })
    }
  }

  const changeMessageRecept = (selected: any) => {
    setData('recipient_id', selected?.value);
  };

  const defaultUser = optionsUser?.filter((o: any) => o.value == initialData?.recipient_id).map((opt: any) => ({ value: opt.label, label: opt.label }));
  return (

    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="grid gap-2">
          <Label htmlFor="send_id">Remetente</Label>
          <Input
            value={auth.user.name}
            readOnly
            type="text"
            id="sender"
            onChange={(e) => setData('sender_id', e.target.value)}
          />
        </div>

        <div className=" grid gap-2">
          <Label htmlFor="recipient_id">Para</Label>
          <Select
            isDisabled={!canEdit}
            menuPosition='fixed'
            defaultValue={defaultUser}
            options={optionsUser}
            onChange={changeMessageRecept}
            placeholder="Selecione o recebedor"
            className="shadow-xs p-0 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                fontSize: '14px',
                boxShadow: 'none',
                border: 'none',
                background: 'transparent',
                paddingBottom: '2px',
              }),
              dropdownIndicator: (base) => ({
                ...base,

              }),
              menuList: (base) => ({
                ...base,
                fontSize: '14px',
              }),
            }}
          />
          <InputError className="mt-2" message={errors.recipient_id} />
        </div>

      </div>

      <div className="grid gap-2">
        <Label htmlFor="service">Título</Label>
        <Input
          readOnly={!canEdit}
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => setData('title', e.target.value)}
        />
        {errors.title && <div className="text-red-500 text-sm">{errors.title}</div>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          readOnly={!canEdit}
          id="message"
          value={data.message}
          onChange={(e) => setData('message', e.target.value)}
        />
        {errors.message && <div className="text-red-500 text-sm">{errors.message}</div>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Status de leitura</Label>
        <Switch
          disabled={!isEdit}
          id="status"
          checked={data.status}
          onCheckedChange={(checked: any) => setData('status', checked)}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={processing}>
          <Save />
          Salvar
        </Button>
      </div>
    </form>
  )
}
