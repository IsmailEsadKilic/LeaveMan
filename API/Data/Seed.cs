using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {
            if (await userManager.Users.AnyAsync()) return;

            var adminPassword = "pMjca2T7etBL29T4JuEv6N7sANKDnJvKTQeaFthMNX35kX9qzUEHfBW3vVzPrnWm";

            var roles = new List<AppRole>
            {
                new AppRole{Name = "Admin"},
                new AppRole{Name = "Employee"}
            };

            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }

            var admin = new AppUser
            {
                UserName = "admin"
            };
            try{
                await userManager.CreateAsync(admin, adminPassword);
                await userManager.AddToRolesAsync(admin, ["Admin", "Employee"]);
            }
            catch(Exception ex){
                Console.WriteLine(ex.Message);
            }
        }
    }
}