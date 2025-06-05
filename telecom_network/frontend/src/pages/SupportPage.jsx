import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBankingDetails, resetPlatformInfoState } from '../features/platformInfo/platformInfoSlice'; // Adjust path if needed

function SupportPage() {
  const dispatch = useDispatch();
  const { bankingDetails, isLoading, isError, message } = useSelector((state) => state.platformInfo);

  useEffect(() => {
    dispatch(fetchBankingDetails());

    // Cleanup on unmount: Reset the platformInfo state when leaving the page.
    // This ensures fresh data is fetched next time and old errors/messages don't persist.
    return () => {
      dispatch(resetPlatformInfoState());
    };
  }, [dispatch]);

  const DetailItem = ({ label, value }) => {
    // Don't render if value is null, undefined, or an empty string after trimming whitespace
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }
    return (
      <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
        <strong style={{ color: '#333A40', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }}>{label}:</strong>
        <span style={{ color: '#555E68', fontSize: '1.05rem', wordBreak: 'break-word' }}>{value}</span> {/* Changed to break-word */}
      </div>
    );
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '760px',
      margin: '30px auto',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333' // Default text color for the page
    }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e0e0e0' }}>
        <h1 style={{ color: '#2F3BA2', fontSize: '2rem', fontWeight: '600' }}>
          Support GlobalMeetup / Service Payments
        </h1>
        <p style={{ fontSize: '1rem', color: '#555E68', marginTop: '10px', lineHeight: '1.5' }}>
          Information for direct bank transfers for contributions or platform services.
          Please ensure all details are entered correctly.
        </p>
      </header>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '25px 30px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.07)'
      }}>
        <h2 style={{
          color: '#2F3BA2',
          fontSize: '1.5rem',
          marginBottom: '20px',
          borderBottom: '2px solid #2F3BA2',
          paddingBottom: '10px'
        }}>
          Bank Account Details
        </h2>
        {isLoading && <p style={{ textAlign: 'center', fontStyle: 'italic', padding: '20px 0', color: '#555E68' }}>Loading banking details...</p>}
        {isError && (
          <p style={{ color: '#D83A56', textAlign: 'center', fontWeight: 'bold', padding: '20px 0', fontSize: '1.1rem' }}>
            Error loading banking details: {message}
          </p>
        )}
        {!isLoading && !isError && bankingDetails && (
          <div>
            <DetailItem label="Bank Name" value={bankingDetails.bank_name} />
            <DetailItem label="Account Holder Name" value={bankingDetails.account_holder_name} />
            <DetailItem label="Account Number" value={bankingDetails.account_number} />
            <DetailItem label="SWIFT/BIC Code" value={bankingDetails.swift_bic} />
            <DetailItem label="IBAN" value={bankingDetails.iban} />
            <DetailItem label="Branch Information" value={bankingDetails.branch_info} />
            {bankingDetails.payment_instructions && (
              <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px dashed #d0d0d0' }}>
                <h3 style={{color: '#333A40', marginBottom: '10px', fontSize: '1.1rem'}}>Important Instructions from Owner:</h3>
                <p style={{ whiteSpace: 'pre-wrap', color: '#444', fontStyle: 'italic', lineHeight: '1.6', background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                  {bankingDetails.payment_instructions}
                </p>
              </div>
            )}
          </div>
        )}
        {/* Message when no details are configured (and no error fetching) */}
        {!isLoading && !isError && !bankingDetails && message && (
           <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#555E68', padding: '20px 0', fontSize: '1.1rem' }}>
             {message}
           </p>
        )}
         {/* Fallback if message is also empty for some reason with no details, and not loading & no error */}
        {!isLoading && !isError && !bankingDetails && !message && (
           <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#555E68', padding: '20px 0', fontSize: '1.1rem' }}>
             Direct bank transfer details are not currently configured by the administrator.
           </p>
        )}
      </div>

      <div style={{
        padding: '25px',
        backgroundColor: '#fffcf0', // Lighter yellow for warning
        color: '#664d03', // Darker text for better contrast on light yellow
        border: '1px solid #ffecb5',
        borderRadius: '12px',
        textAlign: 'left',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0, color: '#664d03', fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px', color: '#ffc107'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Important Security Notice
        </h3>
        <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0', listStyleType: 'disc', lineHeight: '1.6' }}>
          <li style={{marginBottom: '10px'}}>Always verify you are on the official <strong>globalmeetup.com</strong> domain (or the officially communicated domain for this service) before using any payment details. Check the URL in your browser's address bar.</li>
          <li style={{marginBottom: '10px'}}>Ensure the connection is secure (look for <strong>https://</strong> and a lock icon in the address bar).</li>
          <li style={{marginBottom: '10px'}}>GlobalMeetup is not responsible for payments made to incorrect accounts or through fraudulent websites impersonating our platform.</li>
          <li style={{marginBottom: '10px'}}>Direct bank transfers are typically verified manually by the platform owner. Please allow appropriate time for processing and acknowledgement related to any services or contributions.</li>
          <li>If you have any doubts or concerns, please contact us through official support channels (if available and communicated on the platform) before making a payment.</li>
        </ul>
      </div>
    </div>
  );
}
export default SupportPage;
