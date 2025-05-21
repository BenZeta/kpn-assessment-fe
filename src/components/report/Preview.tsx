import { PDFViewer } from '@react-pdf/renderer';
import React from 'react';
import AssessmentReportPDF from './template/AssessmentReportPDF';
import { mockResult } from '@/assets/mockqnaclient';

type PreviewProps = {
    control: any;
    batchId: string;
};

const Preview:React.FC<PreviewProps> = ({control, batchId}) => {
    
    return (
        <PDFViewer width='100%' height='800px' style={{ border: 'none' }}>
            <AssessmentReportPDF data={mockResult.data} />
        </PDFViewer>
            
    )
}
export default Preview;