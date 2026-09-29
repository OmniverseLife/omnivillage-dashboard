import { Box, Grid, Group, Paper, Text } from "@mantine/core";
import { EmptyState } from "./shell";
import { IconChartBar } from "@tabler/icons-react";
import CustomBarChart from "../customBarChart/customBarChart";
import CustomLineChart from "../CustomLineChart/CustomLineChart";
import CustomPieChart from "../customPieChart/customPieChart";

/**
 * A switch over question type, mapping the server's aggregates onto the four
 * existing Highcharts wrappers. No new chart component and no new library —
 * the server already bucketed the numbers, so there is no histogram code here.
 */
export default function ResponseCharts({ stats }) {
    if (!stats) return null;

    const { total, submissionsOverTime = [], perQuestion = [] } = stats;

    if (total === 0) {
        return (
            <EmptyState
                icon={<IconChartBar size={28} />}
                title="Nothing to chart yet"
                description="No responses match these filters."
            />
        );
    }

    const chartFor = (question) => {
        const buckets = question.buckets || [];
        const data = buckets.map((bucket) => ({
            name: bucket.label,
            y: bucket.count,
        }));

        switch (question.type) {
            case "boolean":
                return <CustomPieChart header={question.label} data={data} />;

            case "single_select":
                return buckets.length > 8 ? (
                    <CustomBarChart
                        header={question.label}
                        data={{
                            xAxis: buckets.map((b) => b.label),
                            dataset: [
                                {
                                    name: "Responses",
                                    data: buckets.map((b) => b.count),
                                },
                            ],
                        }}
                    />
                ) : (
                    <CustomPieChart header={question.label} data={data} />
                );

            case "multi_select":
            case "text":
                return (
                    <CustomBarChart
                        header={question.label}
                        data={{
                            xAxis: buckets.map((b) => b.label),
                            dataset: [
                                {
                                    name: "Responses",
                                    data: buckets.map((b) => b.count),
                                },
                            ],
                        }}
                    />
                );

            case "number":
                return (
                    <Box>
                        <CustomBarChart
                            header={question.label}
                            data={{
                                xAxis: buckets.map((b) => b.label),
                                dataset: [
                                    {
                                        name: "Responses",
                                        data: buckets.map((b) => b.count),
                                    },
                                ],
                            }}
                        />
                        {question.stats && (
                            <Group justify="center" gap="lg" mt="xs">
                                {["min", "max", "avg", "median"].map((key) => (
                                    <Text size="xs" key={key}>
                                        <Text span fw={700}>
                                            {key}
                                        </Text>
                                        : {question.stats[key]}
                                    </Text>
                                ))}
                            </Group>
                        )}
                    </Box>
                );

            case "date":
                return (
                    <CustomLineChart
                        header={question.label}
                        data={[
                            {
                                name: question.label,
                                data: buckets.map((b) => [
                                    new Date(b.label).getTime(),
                                    b.count,
                                ]),
                            },
                        ]}
                    />
                );

            case "repeatable_group":
                return (
                    <CustomBarChart
                        header={`${question.label} — rows per response`}
                        data={{
                            xAxis: buckets.map((b) => `${b.label} row(s)`),
                            dataset: [
                                {
                                    name: "Responses",
                                    data: buckets.map((b) => b.count),
                                },
                            ],
                        }}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Box>
            <Paper withBorder radius="md" p="md" mb="md">
                <CustomLineChart
                    header="Submissions over time"
                    data={[{ name: "Submissions", data: submissionsOverTime }]}
                />
            </Paper>

            <Grid gutter="md">
                {perQuestion.map((question) => (
                    <Grid.Col
                        span={{ base: 12, lg: 6 }}
                        key={question.questionId}
                    >
                        <Paper withBorder radius="md" p="md" h="100%">
                            <Group justify="space-between" mb="xs">
                                <Text size="xs" c="dimmed">
                                    answered {question.answered}
                                </Text>
                                {question.skipped > 0 && (
                                    <Text size="xs" c="dimmed">
                                        skipped {question.skipped}
                                    </Text>
                                )}
                            </Group>
                            {chartFor(question)}
                        </Paper>
                    </Grid.Col>
                ))}
            </Grid>
        </Box>
    );
}
