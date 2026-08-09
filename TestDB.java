import java.sql.*;
public class TestDB {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/gymmanagment", "postgres", "1234");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM leads");
        int count = 0;
        while(rs.next()) {
            count++;
            System.out.println("ID: " + rs.getString("id") + ", Name: " + rs.getString("name") + ", OrgId: " + rs.getString("org_id"));
        }
        System.out.println("Total Leads: " + count);
    }
}