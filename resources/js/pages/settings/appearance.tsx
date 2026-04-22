import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    return (
        <AppLayout>
            <Head title="Configurações de aparência" />

            <SettingsLayout>
                <div className="w-full max-w-none space-y-8">
                    <HeadingSmall title="Aparência" description="Defina como a interface da sua conta deve ser exibida" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
