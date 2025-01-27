import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { usePackagesStore } from './data/packagesStore'
import { PackagesPrimaryButtons } from './components/packages-primary-buttons'
import { PackagesDialogs } from './components/packages-dialogs'

export default function Packages() {
  const packages = usePackagesStore((state) => state.packages) // Fetch the packages data using the zustand store

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Packages</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your packages for this month!
            </p>
          </div>
          <PackagesPrimaryButtons /> {/* Update primary buttons */}
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={packages || []} columns={columns} /> {/* Pass the correct packages data */}
        </div>
      </Main>

      <PackagesDialogs /> {/* Ensure the dialogs are updated for packages */}
    </>
  )
}
