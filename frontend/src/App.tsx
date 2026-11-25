import { Sidebar } from './components/Sidebar/Sidebar'
import { LibraryPage } from './pages/LibraryPage'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <LibraryPage />
      </main>
    </div>
  )
}
