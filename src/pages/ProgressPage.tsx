import Layout from '@/components/Layout'
import PageTransition from '@/components/PageTransition'

export default function ProgressPage() {
  return (
    <PageTransition>
      <Layout>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6">
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground text-sm">Progress map — coming in A5.</p>
        </div>
      </Layout>
    </PageTransition>
  )
}
