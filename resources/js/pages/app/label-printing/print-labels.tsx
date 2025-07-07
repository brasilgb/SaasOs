import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer
} from "@react-pdf/renderer";
import { Head, Link, usePage } from "@inertiajs/react";
import { maskPhone } from "@/Utils/mask";
import { ArrowLeft } from "lucide-react";

// Create styles
const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        color: "#3f3f3f",
        marginLeft: '5.7mm',
        marginTop: '12.5mm',
        paddingBottom: '12.5mm',
    },
    section: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        // margin: 10,
        // padding: 10,
        flexGrow: 1,
    },
    etiqueta: {
        width: '33mm',
        height: '17mm',
        // marginRight: '2mm',
        // marginBottom: '0.5mm',
        paddingVertical: '1.5mm',
        borderWidth: 1,
        borderColor: "#ffffff",
        textAlign: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around'
    },
    textmd: {
        fontSize: 10,
        fontWeight: 'semibold',
    },
    textxs: {
        fontSize: 8,
    },
    viewer: {
        width: window.innerWidth, //the pdf viewer will take up all of the width and height
        height: window.innerHeight,
    }
});

export default function PrintLabels({ data }: any) {
    const { app } = usePage().props as any;
    
    return (
        <>
            <Head title="Etiquetas" />
            <div className="h-8 bg-white flex items-center">
                <div className="m-auto">
                    <Link className="flex items-center text-sm font-bold text-sky-500 uppercase"
                        href={route('app.label-printing.index')}
                    >
                        <ArrowLeft />
                        <span>Voltar</span>
                    </Link>
                </div>
            </div>
            <PDFViewer style={styles.viewer} >
                {/* Start of the document*/}
                <Document>
                    {/*render a single page*/}
                    <Page size="A4" style={styles.page} wrap>
                        <View style={styles.section}>
                            {data?.map((item: any) => (
                                <View key={item.order} style={styles.etiqueta} wrap={false} >
                                    <View style={styles.textxs}><Text>{item.order}</Text></View>
                                    <View style={styles.textmd}><Text>{maskPhone(item.telephone)}</Text></View>
                                    <View style={styles.textxs}><Text>{item.company}</Text></View>
                                </View>
                            ))}
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        </>
    )
}