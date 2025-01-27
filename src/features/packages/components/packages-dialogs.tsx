import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { PackagesImportDialog } from './packages-import-dialog' // Replace with package-specific import
import { PackagesMutateDrawer } from './packages-mutate-drawer' // Replace with package-specific drawer
import { usePackagesStore } from '../data/packagesStore'

export function PackagesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePackagesStore() // Adjusted to use the packages store
  return (
    <>
      <PackagesMutateDrawer
        key='package-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <PackagesImportDialog
        key='packages-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <PackagesMutateDrawer
            key={`package-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='package-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              toast({
                title: 'The following package has been deleted:',
                description: (
                  <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
                    <code className='text-white'>
                      {JSON.stringify(currentRow, null, 2)}
                    </code>
                  </pre>
                ),
              })
            }}
            className='max-w-md'
            title={`Delete this package: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a package with the ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}
