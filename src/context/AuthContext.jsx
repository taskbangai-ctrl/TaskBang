import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { supabase } from '../supabaseClient';

const AuthContext = createContext();

const REFERRAL_STORAGE_KEY =
  'taskbang_pending_referral';

const processPendingReferral = async (session) => {
  if (!session?.user) {
    return;
  }

  const referralCode =
    localStorage.getItem(
      REFERRAL_STORAGE_KEY
    );

  if (!referralCode) {
    return;
  }

  const cleanReferralCode =
    referralCode.trim();

  if (!cleanReferralCode) {
    localStorage.removeItem(
      REFERRAL_STORAGE_KEY
    );
    return;
  }

  try {
    const { error } =
      await supabase.rpc(
        'capture_referral_v2',
        {
          p_referral_code:
            cleanReferralCode,
        }
      );

    /*
      Successful referral capture.
      Remove the temporary referral code.
    */
    if (!error) {
      localStorage.removeItem(
        REFERRAL_STORAGE_KEY
      );

      return;
    }

    /*
      These cases mean the referral cannot/should not
      be captured again for this account.
    */
    const message =
      error.message?.toLowerCase() || '';

    if (
      message.includes(
        'already has a referral'
      ) ||
      message.includes(
        'self-referral'
      ) ||
      message.includes(
        'invalid referral code'
      )
    ) {
      localStorage.removeItem(
        REFERRAL_STORAGE_KEY
      );
    }

    /*
      Other errors are intentionally not thrown.
      The authentication session must remain valid even
      if referral capture has a temporary problem.
    */
  } catch {
    /*
      Referral processing must never break login/signup.
    */
  }
};

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);
  const [userRole, setUserRole] =
    useState(null);
  const [userProfile, setUserProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const referralProcessingRef =
    useRef(false);

  // ডাটাবেস থেকে ইউজার রোল এবং প্রোফাইল তথ্য ফেচ করার ফাংশন
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setUserProfile(data);
        setUserRole(data.role || null);
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const initializeAuth =
      async () => {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        const currentUser =
          session?.user ?? null;

        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserProfile(currentUser.id);
        }
        
        setLoading(false);

        /*
          Process referral after an authenticated
          session becomes available.
        */
        if (
          currentUser &&
          !referralProcessingRef.current
        ) {
          referralProcessingRef.current =
            true;

          await processPendingReferral(
            session
          );
        }
      };

    initializeAuth();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const currentUser =
            session?.user ?? null;

          setUser(currentUser);

          if (currentUser) {
            await fetchUserProfile(currentUser.id);
          } else {
            setUserRole(null);
            setUserProfile(null);
          }

          setLoading(false);

          if (
            currentUser &&
            !referralProcessingRef.current
          ) {
            referralProcessingRef.current =
              true;

            await processPendingReferral(
              session
            );
          }

          /*
            If the user logs out, allow the next
            authenticated account to process its own
            pending referral.
          */
          if (!currentUser) {
            referralProcessingRef.current =
              false;
          }
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        userProfile,
        loading,
        signOut: () => supabase.auth.signOut(),
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);