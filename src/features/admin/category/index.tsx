import { Card, CardContent } from '@/components/ui/card'

export function Category() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Category</h1>
        <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
          Modul kategori dan produk belum dihubungkan ke backend.
          Data kategori akan ditampilkan di sini setelah API tersedia.
        </p>
      </div>

      <Card className='overflow-hidden border-border/60 bg-card/90 shadow-sm'>
        <CardContent className='p-10 text-center'>
          <p className='text-[18px] font-medium text-foreground'>Belum ada data kategori</p>
          <p className='mt-2 text-sm text-muted-foreground'>
            Modul produk/kategori sedang dalam pengembangan dan belum terhubung ke backend.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
