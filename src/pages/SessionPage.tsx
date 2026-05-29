import Layout from '@/components/Layout'
import PageTransition from '@/components/PageTransition'

export default function SessionPage() {
  return (
    <PageTransition>
      <Layout>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
          <h1 className="text-2xl font-bold">Study Session</h1>
          <p className="text-muted-foreground text-sm">Session UI — coming in A4.</p>
        </div>
      </Layout>
    </PageTransition>
  )
}
