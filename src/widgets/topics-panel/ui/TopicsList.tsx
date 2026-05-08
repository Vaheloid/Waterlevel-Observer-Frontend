import { Box, Flex, Spinner, VStack, Center, HStack, Badge, Heading, Grid } from '@chakra-ui/react';
import { FiDatabase } from 'react-icons/fi';
import { useState } from 'react';
import type { TopicsListProps, Topic } from '@/shared/types/types';
import { TopicCard } from '@/entities';
import { TopicDeleteDialog } from '@/features';


export function TopicsList({ onTopicSelect, onTopicDelete, selectedTopicId, topics, loading, isSelectionDisabled }: TopicsListProps & { isSelectionDisabled: boolean }) {
    const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

    const handleTopicClick = (topic: Topic) => {
        if (isSelectionDisabled) return;
        const isDeselecting = selectedTopicId === topic.id_topic;
        
        onTopicSelect(isDeselecting ? null : topic.id_topic);

        if (isDeselecting) {
            console.log("Отмена выбора топика: ", topic.name_topic);
        } else {
            console.log("Выбран топик: ", topic.name_topic);
        }
    };

    const confirmDelete = () => {
        if (topicToDelete) {
            onTopicDelete(topicToDelete.id_topic);
            setTopicToDelete(null);
        }
    };

    if (loading && topics.length === 0) {
        return (
            <Center minH="750px" w="full">
                <Spinner borderWidth="3px" animationDuration="0.8s" color="blue.500" size="xl" />
            </Center>
        );
    }

    return (
        <Box w="full" p={4}>
            <TopicDeleteDialog 
                topic={topicToDelete} 
                onClose={() => setTopicToDelete(null)} 
                onConfirm={confirmDelete} 
            />

            <Box maxW="1400px" mx="auto">
                <Flex justify="space-between" align="center" mb={5}>
                    <HStack gap={3}>
                        <Center bg="blue.500" p={2} borderRadius="md" color="white" shadow="0 2px 4px rgba(0,0,0,0.1)">
                            <FiDatabase size="18px" />
                        </Center>
                        <Heading fontSize="15px" fontWeight="500" color={{ base: "gray.800", _dark: "whiteAlpha.900" }}>
                            Управление топиками
                        </Heading>
                    </HStack>
                    <Badge variant="subtle" bg={{ base: "white/50", _dark: "whiteAlpha.200" }} color={{ base: "gray.800", _dark: "whiteAlpha.900" }} borderRadius="full" px={3} py={1} textTransform="none">
                        Всего: {topics.length}
                    </Badge>
                </Flex>

                <VStack align="stretch" gap={4}>
                    <Grid templateColumns="repeat(auto-fill, minmax(360px, 1fr))" gap={5} justifyContent="center">
                        {topics.map((topic) => (
                            <TopicCard
                                key={topic.id_topic}
                                topic={topic}
                                isSelected={selectedTopicId === topic.id_topic}
                                isSelectionDisabled={isSelectionDisabled}
                                onSelect={handleTopicClick}
                                onDelete={setTopicToDelete}
                            />
                        ))}
                    </Grid>
                </VStack>
            </Box>
        </Box>
    );
}