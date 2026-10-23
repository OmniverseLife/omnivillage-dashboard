import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    styled,
} from '@mui/material';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getUsagePurposeTreeMap } from '../../../../../functions/landholdings';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
    marginTop: '2rem',
    boxShadow: theme.shadows[5],
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: theme.shadows[10],
        transform: 'translateY(-4px)',
    },
    border: '1px solid #e0e0e0',
}));

const StyledCardTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h5.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(2),
    color: '#333',
    textAlign: 'center',
}));



const LandUsagePurposeBarChart = () => {
    const [searchParams] = useSearchParams();
    const villageName = searchParams.get('village');
    const country = searchParams.get('country');

    const { data: response, isLoading, isError, error } = useQuery({
        queryKey: ['landUsagePurposeBarChart', villageName, country],
        queryFn: () => getUsagePurposeTreeMap(villageName, country), // Use the getUsagePurposeTreeMap function
        enabled: !!villageName && !!country,
    });

    if (isLoading) {
        return (
            <StyledCard>
                <CardContent
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px',
                    }}
                >
                    <CircularProgress />
                </CardContent>
            </StyledCard>
        );
    }

    if (isError) {
        return (
            <StyledCard>
                <CardContent>
                    <Typography color="error">
                        Error: {error?.message || 'Failed to load land usage purpose data'}
                    </Typography>
                </CardContent>
            </StyledCard>
        );
    }

    // Prepare data for the bar chart.  Use the response directly
    const barChartData = response?.map(item => ({
        ...item,
        name: item.subType.en, // Use English subtype for display
    })) || [];

    return (
        <StyledCard>
            <CardContent>
                <StyledCardTitle>Land Usage Purpose</StyledCardTitle>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={barChartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => value.toLocaleString()} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd', borderRadius: 8 }}
                            labelStyle={{ fontWeight: 'bold', color: '#222' }}
                            itemStyle={{ color: '#333' }}
                            formatter={(value) => value.toLocaleString()}
                        />
                        <Legend />
                        <Bar dataKey="totalArea" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </StyledCard>
    );
};

export default LandUsagePurposeBarChart;
