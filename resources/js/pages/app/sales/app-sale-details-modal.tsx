import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskMoney } from '@/Utils/mask';
import moment from 'moment';

interface SaleDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: any; // Você pode criar uma interface/tipo mais forte para 'sale'
}

export default function SaleDetailsModal({ isOpen, onClose, sale }: SaleDetailsModalProps) {
    if (!sale) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Detalhes da Venda #{sale.sales_number}</DialogTitle>
                    <DialogDescription>Realizada em {moment(sale.created_at).format('DD/MM/YYYY [às] HH:mm')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="text-sm">
                        <p>
                            <strong>Cliente:</strong> {sale.customer?.name || 'Não informado'}
                        </p>
                        <p>
                            <strong>Pagamento:</strong> {sale.payment_method || 'Não informado'}
                        </p>
                        <p>
                            <strong>Status financeiro:</strong> {sale.financial_status || 'Não informado'}
                        </p>
                        <p>
                            <strong>Valor pago:</strong> {maskMoney(String(sale.paid_amount || 0))}
                        </p>
                        <p>
                            <strong>Saldo:</strong> {maskMoney(String(Number(sale.total_amount || 0) - Number(sale.paid_amount || 0)))}
                        </p>
                        {sale.status === 'cancelled' && (
                            <>
                                <p>
                                    <strong>Cancelada em:</strong> {sale.cancelled_at ? moment(sale.cancelled_at).format('DD/MM/YYYY [às] HH:mm') : '-'}
                                </p>
                                <p>
                                    <strong>Cancelada por:</strong> {sale.cancelled_by?.name || 'Não informado'}
                                </p>
                                <p>
                                    <strong>Motivo:</strong> {sale.cancel_reason || 'Não informado'}
                                </p>
                            </>
                        )}
                        {sale.fiscal_document_number && (
                            <>
                                <p>
                                    <strong>Documento fiscal:</strong> {sale.fiscal_document_number}
                                </p>
                                <p>
                                    <strong>Chave:</strong> {sale.fiscal_document_key || '-'}
                                </p>
                                <p>
                                    <strong>Emitido em:</strong> {sale.fiscal_issued_at ? moment(sale.fiscal_issued_at).format('DD/MM/YYYY [às] HH:mm') : '-'}
                                </p>
                                <p>
                                    <strong>Registrado por:</strong> {sale.fiscal_registered_by?.name || '-'}
                                </p>
                            </>
                        )}
                    </div>

                    <div>
                        <h4 className="mb-2 font-semibold">Itens da Venda</h4>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead className="text-center">Qtd.</TableHead>
                                        <TableHead className="text-right">Valor Unit.</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.items?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.part?.name}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{maskMoney(item.unit_price)}</TableCell>
                                            <TableCell className="text-right">{maskMoney(String(item.quantity * item.unit_price))}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell colSpan={3} className="text-right">
                                            Total
                                        </TableCell>
                                        <TableCell className="text-right">{maskMoney(sale.total_amount)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-2 font-semibold">Histórico da Venda</h4>
                        <div className="space-y-2">
                            {sale.logs?.length ? (
                                sale.logs.map((log: any) => (
                                    <div key={log.id} className="rounded border p-2 text-xs">
                                        <div>
                                            <strong>Ação:</strong> {log.action}
                                        </div>
                                        <div>
                                            <strong>Usuário:</strong> {log.user?.name || 'Sistema'}
                                        </div>
                                        <div>
                                            <strong>Data:</strong> {moment(log.created_at).format('DD/MM/YYYY HH:mm')}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted-foreground text-sm">Sem histórico registrado.</div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
