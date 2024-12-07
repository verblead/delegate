@@ .. @@
 export function useMembers() {
   const [members, setMembers] = useState<Member[]>([]);
   const [loading, setLoading] = useState(true);
   const { supabase } = useSupabase();
   const { user } = useAuth();
   const { toast } = useToast();
 
   useEffect(() => {
     if (!user) return;
 
     const fetchMembers = async () => {
       try {
-        console.log('Fetching members');
-        
         const { data, error } = await supabase
           .from('profiles')
           .select(`
             id,
             email,
             username,
             avatar_url,
             role,
             points,
             status,
             created_at,
             city,
             state
           `)
           .order('username', { ascending: true });
 
         if (error) throw error;
-        console.log('Fetched members:', data);
         setMembers(data || []);
       } catch (error) {
         console.error('Error fetching members:', error);
         toast({
           title: "Error",
           description: "Failed to load members",
           variant: "destructive",
         });
       } finally {
         setLoading(false);
       }
     };
 
     fetchMembers();
 
     const channel = supabase
       .channel('members')
       .on(
         'postgres_changes',
         { event: '*', schema: 'public', table: 'profiles' },
         fetchMembers
       )
       .subscribe();
 
     return () => {
       channel.unsubscribe();
     };
   }, [user, supabase, toast]);