import VideoPlaylistDetailClient from './VideoPlaylistDetailClient';

export async function generateStaticParams() {
    return [{ id: 'id' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <VideoPlaylistDetailClient id={id} />;
}
