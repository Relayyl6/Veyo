import { Redirect } from 'expo-router'
import { Text, View } from 'react-native'

const index = () => {
  return (
    <Redirect href="/(auth)/welcome" />
  )
}

export default index