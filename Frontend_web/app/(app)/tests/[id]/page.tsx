import ActiveTestClient from './ActiveTestClient';

export async function generateStaticParams() {
    return [{ id: 'id' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ActiveTestClient id={id} />;
}
