import SettingsSidebar from "./_components/settings-sidebar"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-row items-start gap-4 sm:gap-6 lg:gap-8">
      <SettingsSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
