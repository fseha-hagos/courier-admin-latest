import { IconDownload, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { usePackagesStore } from '../data/packagesStore'
import { Link } from '@tanstack/react-router'

export function PackagesPrimaryButtons() {
  const { setOpen } = usePackagesStore()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <IconDownload size={18} />
      </Button>
      <Button className='space-x-1' asChild>
        <Link to='/packages/create'>
          Create
          <IconPlus />
        </Link>
      </Button>
    </div>
  )
}
