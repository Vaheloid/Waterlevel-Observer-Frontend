import { Box, Heading, Text, Center, Stack } from "@chakra-ui/react"
import { useState } from 'react'
import { useForm } from "react-hook-form"
import type { FormValues } from "@/shared/types/types"
import { loginUser } from "@/shared"
import { LoginForm, LoginLayout } from "@/features"


export default function Login() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [loginError, setLoginError] = useState<string | null>(null)
	const { reset } = useForm<FormValues>()

	const handleLogin = async (data: FormValues) => {
		setIsSubmitting(true)
		setLoginError(null)

		try {
			await loginUser(data)
			window.location.replace('./mainpage.html');
			reset()
		} 
		catch {
			setLoginError("Неверный логин или пароль")
		} 
		finally {
			setIsSubmitting(false)
		}
	}

	return (
		<LoginLayout>
			<Stack gap="6">
				<Box textAlign="center">
					<Heading size="xl" fontWeight="semibold" color={{ base: "gray.800", _dark: "whiteAlpha.900" }}>
						Вход
					</Heading>
					<Text color={{ base: "gray.600", _dark: "whiteAlpha.700" }} fontSize="sm" mt="1">
						Используйте свою учетную запись
					</Text>
				</Box>

				<LoginForm 
					onSubmit={handleLogin} 
					isSubmitting={isSubmitting} 
					loginError={loginError} 
				/>

				<Center>
					<Text fontSize="xs" color="gray.500">
						2026 П3 Солюшенс
					</Text>
				</Center>
			</Stack>
		</LoginLayout>
	)
}