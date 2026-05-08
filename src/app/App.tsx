import { BrowserRouter } from 'react-router-dom'
import { Flex } from '@chakra-ui/react'
import '../app/styles/index.css'
import MainPage from '@/pages/main/ui/MainPage'

export default function App() {

  return (
    <BrowserRouter>
      <Flex className="App" h="100vh" direction="column">
        <MainPage />
      </Flex>
    </BrowserRouter>
    
  )
}