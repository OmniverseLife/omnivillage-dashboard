import React, { useState, useCallback } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    styled,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getParcelSizeDistribution } from "../../../../../functions/landholdings";

// Helper function to determine age range from the input 'range' string
const getAgeRange = (rangeString) => {
    const parts = rangeString.split('–');
    const min = parseInt(parts[0], 10);
    const max = parts[1].includes('<') ? parseInt(parts[1].slice(1), 10) : parseInt(parts[1], 10);
    return { min, max };
};

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
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
    textAlign: 'center'
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.spacing(2),
        boxShadow: theme.shadows[10],
        width: '90%',
        maxWidth: '800px',
    },
}));



const HistogramWithDrilldown = () => {
    const [selectedOwners, setSelectedOwners] = useState(null);
    const [open, setOpen] = useState(false);
    const [searchParams] = useSearchParams();
    // Get villageName and country from query parameters
    const villageName = searchParams.get('village');
    const country = searchParams.get('country');

    const { data: response, isLoading, isError, error } = useQuery({
        queryKey: ['parcelSizeDistribution', villageName, country],
        queryFn: () => getParcelSizeDistribution(villageName, country),
        enabled: !!villageName && !!country,
    });

    const chartData = response?.distribution?.map((item) => {
        const { min, max } = getAgeRange(item.range);
        return {
            ageRange: item.range,
            count: item.count,
            owners: item.owners,
            min,
            max
        };
    }) || [];

    // Function to handle bar click and open the dialog
    const handleBarClick = useCallback((data) => {
        console.log('Bar clicked:', data);
        if (data && data.activePayload && data.activePayload.length > 0) {
            setSelectedOwners(data.activePayload[0].payload.owners);
            setOpen(true);
        }
    }, []);

    // Function to close the dialog
    const handleClose = () => {
        setOpen(false);
        setSelectedOwners(null);
    };

    // Log scale formatter for Y-axis
    const logTickFormatter = (value) => {
        if (value === 0) return '0';
        const magnitude = Math.floor(Math.log10(value));
        const base = Math.pow(10, magnitude);
        const num = value / base;
        return num === 1 ? `10^${magnitude}` : '';
    };

    // Function to format numbers with commas
    const formatNumberWithCommas = (value) => {
        return value.toLocaleString();
    };

    if (isLoading) {
        return (
            <StyledCard>
                <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                    </div>
                </CardContent>
            </StyledCard>
        );
    }

    if (isError) {
        return (
            <StyledCard>
                <CardContent>
                    <Typography color="error">
                        Error: {error?.message || 'Failed to load data'}
                    </Typography>
                </CardContent>
            </StyledCard>
        );
    }

    return (
        <StyledCard>
            <CardContent>
                <StyledCardTitle>Landholding Size Distribution</StyledCardTitle>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        onClick={(data) => handleBarClick(data)}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="ageRange"
                            tick={{ fontSize: 12 }}
                            label={{
                                value: 'Parcel Size Range (sqft)', // Added (sqft)
                                position: 'insideBottom',
                                offset: 0,
                                fill: '#555',
                                fontSize: 14
                            }}
                        />
                        <YAxis
                            tickFormatter={(value) => formatNumberWithCommas(logTickFormatter(value))} // Apply formatting
                            scale="log"
                            domain={[1, 'dataMax']}
                            label={{
                                value: 'Count (Log Scale)',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#555',
                                fontSize: 14
                            }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd', borderRadius: 8 }}
                            labelStyle={{ fontWeight: 'bold', color: '#222' }}
                            itemStyle={{ color: '#333', cursor: 'pointer' }}
                            formatter={(value) => formatNumberWithCommas(value)} // Tooltip formatting
                        />
                        <Bar
                            dataKey="count"
                            fill="#8884d8"
                            name="Count"
                            style={{ cursor: 'pointer' }}
                        />
                    </BarChart>
                </ResponsiveContainer>

                {/* Dialog for displaying owner details */}
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Owners in Selected Parcel Size Range</DialogTitle>
                    <DialogContent>
                        {selectedOwners && selectedOwners.length > 0 ? (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{whiteSpace:"nowrap"}}>First Name</TableCell>
                                        <TableCell style={{whiteSpace:"nowrap"}}>Last Name</TableCell>
                                        <TableCell>Village</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell style={{whiteSpace:"nowrap"}}>Total Land (ac)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedOwners.map((owner, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{owner.first_name}</TableCell>
                                            <TableCell>{owner.last_name}</TableCell>
                                            <TableCell>{owner.village_name}</TableCell>
                                            <TableCell>{owner.country_code}{owner.phone}</TableCell>
                                            <TableCell style={{fontWeight:"600"}}>{owner.total_land}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography>No owners found for this range.</Typography>
                        )}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={handleClose} variant="outlined">
                                Close
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </StyledCard>
    );
};

export default HistogramWithDrilldown;
