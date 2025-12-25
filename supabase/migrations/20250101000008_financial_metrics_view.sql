-- Migration: Create Financial Metrics View
-- Created by Jules

-- 1. Create View for aggregating financial data per organization
CREATE OR REPLACE VIEW public.financial_metrics AS
SELECT
    organization_id,
    -- Total Revenue: Sum of all paid bills
    COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as total_revenue,

    -- Pending Revenue: Sum of all pending bills
    COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_revenue,

    -- Monthly Revenue: Sum of all paid bills where paid_at is in the current month
    COALESCE(SUM(amount) FILTER (
        WHERE status = 'paid'
        AND paid_at >= date_trunc('month', now())
    ), 0) as monthly_revenue
FROM
    public.patient_bills
GROUP BY
    organization_id;

-- 2. Grant permissions (though RLS on underlying tables applies, Views can sometimes bypass if not careful,
-- but here we want to filter by org_id. Since Views don't have RLS directly, we usually access this
-- via a function or just ensure the query filters by org_id on the client side.
-- However, for Supabase Auto-API to work securely, it's better to make this a SECURITY DEFINER function
-- or rely on the fact that the user can only see data if we join or filter.
-- Actually, simple Views in Supabase DO inherit RLS if defined properly, or we can use a function.
-- Let's create a function to fetch metrics for the current user's org to be safe and easy.)

CREATE OR REPLACE FUNCTION public.get_financial_metrics()
RETURNS TABLE (
    total_revenue numeric,
    pending_revenue numeric,
    monthly_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.total_revenue,
        m.pending_revenue,
        m.monthly_revenue
    FROM
        public.financial_metrics m
    JOIN
        public.profiles p ON p.organization_id = m.organization_id
    WHERE
        p.id = auth.uid();
END;
$$;
