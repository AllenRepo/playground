using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace Wcf.Host1
{
    public class Program
    {
        public static void Main(string[] args)
        {
            ServiceHost host = new ServiceHost(typeof(Wcf.Service1.Host1));
            host.Open();

            Console.WriteLine("Server started");
            Console.ReadLine();
            host.Close();
        }
    }
}
