import { 
    Box, Flex, VStack, Text, Button, HStack, Center, Separator, Grid
} from '@chakra-ui/react';
import { FiTrash2, FiActivity, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import type { Topic } from '@/shared/types/types';

interface TopicCardProps {
    topic: Topic;
    isSelected: boolean;
    isSelectionDisabled: boolean;
    onSelect: (topic: Topic) => void;
    onDelete: (topic: Topic) => void;
}

export const TopicCard = ({ topic, isSelected, isSelectionDisabled, onSelect, onDelete }: TopicCardProps) => {
    const shouldBlur = isSelectionDisabled && !isSelected;

    return (
        <Box
            as={motion.div}
            p={4}
            position="relative"
            borderRadius="xl"
            backdropFilter="blur(10px)"
            bg={isSelected 
                ? { base: "white", _dark: "whiteAlpha.200" } 
                : { base: "rgba(255, 255, 255, 0.7)", _dark: "whiteAlpha.200" }}
            transitionProperty="all"
            transitionDuration="0.4s"
            transitionTimingFunction="cubic-bezier(0.25, 1, 0.5, 1)"
            _hover={!isSelectionDisabled ? {
                bg: { base: "white", _dark: "whiteAlpha.200" },
                shadow: "0 12px 24px rgba(0,0,0,0.15)",
                transform: "translateY(-5px)",
            } : {}}
            _active={!isSelectionDisabled ? { transform: "scale(0.97)" } : {}}
            border={{ base: "1px solid", _dark: "none" }}
            borderColor={{ base: "gray.200", _dark: "none" }}
            outline="none"
            boxShadow="none"
            css={{
                "&:focus": { boxShadow: "none !important", outline: "none !important" },
                "&:active": { boxShadow: "none !important", outline: "none !important" },
                WebkitTapHighlightColor: "transparent"
            }}
            onClick={() => onSelect(topic)}
            onMouseDown={(e) => e.preventDefault()}
            opacity={shouldBlur ? 0.4 : 1}
            filter={shouldBlur ? "grayscale(0.8) blur(1px)" : "none"}
            cursor={isSelectionDisabled ? "not-allowed" : "pointer"}
        >
            {isSelected && (
                <Box 
                    position="absolute" left="0" top="20%" bottom="20%" w="4px" 
                    bg={{ base: "blue.500", _dark: "white" }} borderRadius="full" 
                />
            )}

            <Flex justify="space-between" align="start" mb={3}>
                <HStack gap={3}>
                    <Center 
                        transition="all 0.3s ease"
                        bg={isSelected ? { base: "blue.50", _dark: "whiteAlpha.300" } : { base: "gray.100", _dark: "whiteAlpha.50" }} 
                        boxSize="40px" borderRadius="md" 
                        color={isSelected ? { base: "blue.600", _dark: "white" } : { base: "gray.600", _dark: "whiteAlpha.800" }}
                    >
                        <FiActivity size="18px" />
                    </Center> 
                    <VStack align="start" gap={0}>
                        <Text fontWeight="600" fontSize="sm" color={isSelected ? { base: "gray.800", _dark: "white" } : { base: "gray.800", _dark: "whiteAlpha.900" }} lineClamp={1}>
                            {topic.name_topic}
                        </Text>
                        <Text fontSize="11px" color={isSelected ? { base: "gray.500", _dark: "whiteAlpha.700" } : "gray.500"} fontFamily="mono">
                            #ID:{topic.id_topic}
                        </Text>
                    </VStack>
                </HStack>
                <FiChevronRight color={isSelected ? "white" : "#A0AEC0"} />
            </Flex>

            <Box bg={isSelected ? { base: "gray.100/50", _dark: "whiteAlpha.200" } : { base: "gray.100/50", _dark: "blackAlpha.300" }} px={2} py={1.5} borderRadius="md" mb={4}>
                <Text fontSize="sm" color={isSelected ? { base: "gray.600", _dark: "whiteAlpha.900" } : { base: "gray.600", _dark: "whiteAlpha.700" }} fontFamily="Segoe UI, system-ui">
                    {topic.path_topic}
                </Text> 
            </Box>

            <Grid templateColumns="1fr 1fr 1fr" gap={2} mb={4} justifyItems="center">
                <VStack align="center" gap={0}>
                    <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase">Координаты</Text>
                    <Text fontSize="13px" fontWeight="600" color={{ base: "gray.700", _dark: "whiteAlpha.900" }} textAlign="center">
                        {topic.latitude_topic.toFixed(6)}° <br/> {topic.longitude_topic.toFixed(6)}°
                    </Text>
                </VStack>
                
                <VStack align="center" gap={0} borderLeft="1px solid" borderColor="gray.200" width="100%">
                    <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase">Высота активации</Text>
                    <Text fontSize="13px" fontWeight="600" color={isSelected ? { base: "teal.500", _dark: "teal.500"} : "teal.500"} textAlign="center" marginTop="1">
                        {topic.altitude_topic} м
                    </Text>
                </VStack>

                <VStack align="center" gap={0} borderLeft="1px solid" borderColor="gray.200" width="100%" >
                    <Text fontSize="10px" color="gray.400" fontWeight="600" textTransform="uppercase">Высота <br/> датчика</Text>
                    <Text fontSize="13px" fontWeight="600" color={isSelected ? { base: "blue.500", _dark: "blue.500"} : "blue.500"} textAlign="center" marginTop="1">
                        {topic.altitudeSensor_topic} м
                    </Text>
                </VStack>
            </Grid>

            <Separator mb={3} opacity={isSelected ? "0.6" : "0.2"} borderColor="whiteAlpha.400" />

            <Button 
                size="sm" variant="ghost" w="full" h="32px" borderRadius="md" fontSize="sm"
                bg={{ base: "gray.50", _dark: "whiteAlpha.100" }}
                color={{ base: "gray.600", _dark: "whiteAlpha.900" }}
                transition="all 0.3s ease"
                disabled={isSelectionDisabled} 
                _hover={!isSelectionDisabled ? { bg: { base: "red.50", _dark: "whiteAlpha.300" }, color: "red.600", transform: "scale(1.02)" } : {}}
                _focus={{ outline: "none", boxShadow: "none" }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelectionDisabled) onDelete(topic);
                }}
            >
                <FiTrash2 style={{ marginRight: '6px' }} size="14px" /> 
                Удалить топик
            </Button>
        </Box>
    );
};