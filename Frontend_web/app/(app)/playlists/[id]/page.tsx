import PlaylistDetailsClient from './PlaylistDetailsClient';

export async function generateStaticParams() {
    return [{ id: 'id' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PlaylistDetailsClient id={id} />;
}
