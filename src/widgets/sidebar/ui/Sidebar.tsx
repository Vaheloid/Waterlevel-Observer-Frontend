import { Box, VStack, Flex, Heading, Spacer } from "@chakra-ui/react";
import { Menu, BarChart3, Plus, PanelLeftClose, Sun, Moon, LogOut, Hexagon, Circle } from "lucide-react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { NavButton } from "@/widgets";
import type { FormValues, SidebarProps } from "@/shared/types/types";
import { useColorMode } from "../../../shared/ui/color-mode";
import { logoutUser } from "@/shared";
import { queryClient } from "@/app/providers/queryClient";

export const Sidebar = ({ isOpen, onToggle, activePanel, onPanelToggle, polygonMode, onPolygonModeToggle}: SidebarProps) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const iconColor = { base: "gray.800", _dark: "white" };

    const sidebarTransition: Transition = {
        type: "tween",
        ease: "easeInOut",
        duration: 0.3,
    };

    const clearAllCookies = () => {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        
        // Базовые параметры для удаления
        const path = "/";
        const domain = window.location.hostname;
        const shortDomain = domain.split('.').slice(-2).join('.'); // например, "example.com"

        // Пытаемся удалить куку с разными комбинациями путей и доменов
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=.${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=.${shortDomain}`;
    }
};

    const Logout = async () => {
        try {
            await logoutUser({ login_user: "", password_user: "" } as FormValues);
        } catch (error) {
            console.error("Ошибка при запросе на логаут:", error);
        } finally {
            queryClient.clear();

            clearAllCookies();

            localStorage.clear();
            sessionStorage.clear();

            window.location.replace("/login.html");
        }
    };

    return (
        <motion.aside
            layout
            animate={{ width: isOpen ? 280 : 70 }}
            transition={sidebarTransition}
            style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                bottom: "10px",
                zIndex: 200,
                display: "flex",
                overflow: "hidden",
                willChange: "width", 
                borderRadius: "12px"
            }}
        >
            <Box
                as="div"
                w="full"
                h="full"
                bg={{ base: "rgba(255, 255, 255, 0.7)", _dark: "rgba(0, 0, 0, 0.7)" }}
                backdropFilter="blur(12px) saturate(180%)"
                borderRadius="xl"
                p={4}
                display="flex"
                flexDirection="column"
                border="1px solid"
                borderColor={{ base: "whiteAlpha.300", _dark: "whiteAlpha.100" }}
                boxShadow="xl"
            >
                <VStack align="center" gap={6} flex={1} h="full">
                    <Flex w="full" align="center" justify={isOpen ? "space-between" : "center"} h="48px">
                        <AnimatePresence mode="wait">
                            {isOpen && (
                                <motion.div
                                    key="title"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                                >
                                    <Heading size="sm" color={{ base: "blue.600", _dark: "whiteAlpha.900" }} ml={2} whiteSpace="nowrap">
                                        НАВИГАЦИЯ 
                                    </Heading>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <NavButton
                            icon={isOpen ? <PanelLeftClose size={24} color="currentColor" /> : <Menu size={24} />}
                            color={iconColor}
                            isExpanded={false}
                            onClick={onToggle}
                            aria-label="Toggle Sidebar"
                        />      
                    </Flex>
                    
                    <VStack w="full" gap={2} align={isOpen ? "stretch" : "center"}>
                        <NavButton
                            icon={<BarChart3 size={24} color="currentColor" />}
                            color={iconColor}
                            label="Топики"
                            isExpanded={isOpen}
                            isActive={activePanel === "topics"}
                            onClick={() => onPanelToggle("topics")}
                        />
                        <NavButton
                            icon={<Plus size={24} color="currentColor" />}
                            color={iconColor}
                            label="Добавить топик"
                            isExpanded={isOpen}
                            isActive={activePanel === "add"}
                            onClick={() => onPanelToggle("add")}
                        />
                    </VStack>

                    <Spacer />
                            
                    {/* Кнопки в нижней части */}
                    <VStack w="full" gap={2} align={isOpen ? "stretch" : "center"}>
                        {/* НОВАЯ КНОПКА ПЕРЕКЛЮЧЕНИЯ РЕЖИМА */}
                        <NavButton
                            icon={polygonMode === "hull" ? <Hexagon size={24} /> : <Circle size={24} />}
                            color={iconColor}
                            label={polygonMode === "hull" ? "Режим: Полигон" : "Режим: Круги"}
                            isExpanded={isOpen}
                            onClick={onPolygonModeToggle}
                        />
                        <NavButton
                            icon={colorMode === "light" ? <Moon size={24} color="currentColor" /> : <Sun size={24} color="currentColor" />}
                            color={iconColor}
                            label={colorMode === "light" ? "Темная тема" : "Светлая тема"}
                            isExpanded={isOpen}
                            onClick={toggleColorMode}
                        />

                        <NavButton
                            icon={<LogOut size={24} color="currentColor" />}
                            color={{ base: "black", _dark: "white" }}
                            label="Выйти"
                            isExpanded={isOpen}
                            onClick={Logout}
                        />
                    </VStack>
                </VStack>
            </Box>
        </motion.aside>
    );
};